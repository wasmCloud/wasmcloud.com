---
title: "Automatically Updating OCI URLs with wasmCloud and Azure Webhooks"
date: 2023-07-19T9:00:00-05:00
image: "/img/webhookwasmcloud.png"
author: "Brooks Townsend"
tags: ["wasmcloud", "developer", "wasm", "cloud", "Azure"]
---

![Azure webhook and wasmcloud logo](/img/webhookwasmcloud.png)

wasmCloud uses GitHub actions to publish all of its example WebAssembly modules and first-party capability providers to AzureCR. Neither of these are actual containers, nevertheless they conform to the OCI image specification and can be distributed well with the existing OCI tooling in the cloud native ecosystem.

<!--truncate-->

Over the past couple of months (years?) we've had an issue with discoverability of these artifacts. AzureCR doesn't support _unauthenticated_ content discovery of the artifacts we publish to wasmcloud.azurecr.io, so we've had to make do with remembering to update a README when we release new versions of resources.

:::warning
Do not rely on remembering to update a README when releasing new versions of resources. Humans are feeble, forgetful creatures.
:::

As you can infer from the warning above, relying on updating a README for these versions didn't really cut it. After we neglected the README long enough, we brainstormed a few possible solutions. All we needed was to have a process that automatically updated those references, preferably after the artifact was successfully pushed to the registry.

## Azure Registry Webhooks

Turns out, there's a great mechanism for this with [Azure Container Registry Webhooks!](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-webhook) The are different types of webhooks but, since we want to update the latest OCI reference based on when a new version is pushed, we can hook into the `push` event.

:::info

A webhook is an HTTP-based callback function that allows lightweight, event-driven communication between 2 application programming interfaces (APIs). source: https://www.redhat.com/en/topics/automation/what-is-a-webhook

:::

If you're new to webhooks, all this effectively means is that, whenever we push a new artifact, Azure will send an HTTP request with a structured payload to an endpoint that we register. So, I can write an actor that accepts HTTP requests, stores that information to a persistent key-value store, and allow fetching of that data.

From the [schema reference](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-webhook-reference#payload-example-image-push-event), here's an example payload:

```json
{
  "id": "cb8c3971-9adc-488b-xxxx-43cbb4974ff5",
  "timestamp": "2017-11-17T16:52:01.343145347Z",
  "action": "push",
  "target": {
    "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
    "size": 524,
    "digest": "sha256:xxxxd5c8786bb9e621a45ece0dbxxxx1cdc624ad20da9fe62e9d25490f33xxxx",
    "length": 524,
    "repository": "hello-world",
    "tag": "v1"
  },
  "request": {
    "id": "3cbb6949-7549-4fa1-xxxx-a6d5451dffc7",
    "host": "myregistry.azurecr.io",
    "method": "PUT",
    "useragent": "docker/17.09.0-ce go/go1.8.3 git-commit/afdb6d4 kernel/4.10.0-27-generic os/linux arch/amd64 UpstreamClient(Docker-Client/17.09.0-ce \\(linux\\))"
  }
}
```

There's a good bit of information here, but all we need is the reference and the artifact that it corresponds to. We'll be able to form the reference, thanks to the OCI image specification, from the above it will be a combination of `request.host`, `repository` and `tag`.

## Writing the Actor

:::info
The full, completed, source code for this example can be found in the GitHub repository [brooksmtownsend/ocireffer](https://github.com/brooksmtownsend/ocireffer)
:::

I started using the wasmCloud "hello world" template, since it scaffolds out a basic HTTP server handler. If you're following along with this blog, make sure you have [wash](https://wasmcloud.com/docs/installation) installed.

```shell
wash new actor webhook-handler --template-name hello
```

From there, a new actor project is generated in `./webhook-handler` with a barebones HTTP handler.

```rust
use wasmbus_rpc::actor::prelude::*;
use wasmcloud_interface_httpserver::{HttpRequest, HttpResponse, HttpServer, HttpServerReceiver};

#[derive(Debug, Default, Actor, HealthResponder)]
#[services(Actor, HttpServer)]
struct WebhookHandlerActor {}

/// Implementation of the HttpServer capability contract
#[async_trait]
impl HttpServer for WebhookHandlerActor {
    async fn handle_request(&self, _ctx: &Context, _req: &HttpRequest) -> RpcResult<HttpResponse> {
        Ok(HttpResponse::ok("Hello, World!"))
    }
}
```

### Starting and Testing

The neat part is that, here, I don't have to worry about what libraries or databases I have to use, I can just start functionally designing my application thanks to the [interface driven development](https://wasmcloud.com/docs/fundamentals/interface_driven_development) model that wasmCloud is based on. I already have my HTTP handler setup, so the only thing needed there is to define my endpoints and handle the logic appropriately. I know that I will be storing and retrieving OCI references based on which actor or provider that I'm querying, which sounds like a perfect case for a key-value store. Last, I'd like to have some logging functionality so that I can do some testing and debugging. Let's add those capabilities.

### Adding capabilities

We can use `cargo add` to add the interfaces for `keyvalue` and `logging`, and then ensure that this actor has the capability claim to use these interfaces. While we're at it, we're also going to need some deserialization logic for the payload later, so we can add the `serde` and `serde_json` libraries now as well.

```shell
cargo add wasmcloud-interface-keyvalue wasmcloud-interface-logging
cargo add serde serde_json
```

Next, in `wasmcloud.toml`, modify the actor claims section to include our new capabilities. This is required because each capability is deny-by-default for wasmCloud, so you know exactly what each actor plans to do without ever looking at the code.

```toml
name = "webhook-handler"
language = "rust"
type = "actor"
version = "0.1.0"

[actor]
claims = ["wasmcloud:httpserver", "wasmcloud:keyvalue", "wasmcloud:builtin:logging"]
```

### Handling the webhook payload

Thanks to the example documentation, we already know the shape of the payload that Azure will send our actor. We can set up a simple unit test case to make sure we can parse that payload properly, and then we can add in our handler logic. I created a separate file `src/azure.rs` to keep everything nice and clean, and added the serde struct definition there. Additionally, since there are going to be many different fields that we don't end up using, I mark those as `#[serde(default)]` to ensure that we can deserialize properly even if they aren't present for some reason.

```rust src/azure.rs
//! Azure Container Registry Webhook Payload
//! All non-critical fields are optional.

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestPayload {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub timestamp: String,
    #[serde(default)]
    pub action: String,
    pub target: Target,
    pub request: Request,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Target {
    #[serde(rename = "mediaType")]
    #[serde(default)]
    pub media_type: String,
    #[serde(default)]
    pub size: i32,
    #[serde(default)]
    pub digest: String,
    #[serde(default)]
    pub length: i32,
    pub repository: String,
    pub tag: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Request {
    #[serde(default)]
    pub id: String,
    pub host: String,
    #[serde(default)]
    pub method: String,
    #[serde(default)]
    pub useragent: String,
}
```

:::info
I don't usually use AI-based tools to develop other than Copilot, but this is one area where ChatGPT excels. Paste in a JSON blob, ask it to generate some Rust code to deserialize that payload, and voila.
:::

### Handling requests, storing in keyvalue

Let's start by adding two endpoints, a `POST` for handling the webhook and a `GET` for retrieving an item. I'll add some logging here as well so we can see that we're following the correct code paths.

```rust
use wasmbus_rpc::actor::prelude::*;
use wasmcloud_interface_httpserver::{HttpRequest, HttpResponse, HttpServer, HttpServerReceiver};
use wasmcloud_interface_keyvalue::{KeyValue, KeyValueSender, SetRequest};

mod azure;
use azure::*;

#[derive(Debug, Default, Actor, HealthResponder)]
#[services(Actor, HttpServer)]
struct WebhookHandlerActor {}

/// Implementation of the HttpServer capability contract
#[async_trait]
impl HttpServer for WebhookHandlerActor {
    async fn handle_request(&self, ctx: &Context, req: &HttpRequest) -> RpcResult<HttpResponse> {
        Ok(match (&req.method[..], &req.path[..]) {
            ("POST", "/api/azurehook") => HttpResponse::ok("Put reference from Azure"),
            ("GET", name) => HttpResponse::ok(format!("Fetch ref {name}")),
            _ => HttpResponse::not_found(),
        })
    }
}
```

Once we have different `match` blocks setup to handle our requests, we can add keyvalue operations to store the values.

```rust
/// Implementation of the HttpServer capability contract
#[async_trait]
impl HttpServer for WebhookHandlerActor {
    async fn handle_request(&self, ctx: &Context, req: &HttpRequest) -> RpcResult<HttpResponse> {
        wasmcloud_interface_logging::info!("Received request: {req:?}");
        Ok(match (&req.method[..], &req.path[..]) {
            ("POST", "/api/azurehook") => {
                if let Ok(event) = serde_json::from_slice::<RequestPayload>(&req.body) {
                    let name = &event.target.repository;
                    let url = format!(
                        "{}/{}:{}",
                        event.request.host, event.target.repository, event.target.tag
                    );
                    if let Err(e) = KeyValueSender::new()
                        .set(
                            ctx,
                            &SetRequest {
                                key: name.to_string(),
                                value: url.to_string(),
                                expires: 0,
                            },
                        )
                        .await
                    {
                        HttpResponse::internal_server_error(format!("Failed to store url: {e:?}",))
                    } else {
                        HttpResponse::ok(format!("Url {url} stored for {name}"))
                    }
                } else {
                    HttpResponse::bad_request(
                        "Azure webhook payload did not contain required fields",
                    )
                }
            }
            ("GET", name) => HttpResponse::ok(
                KeyValueSender::new()
                    .get(ctx, name)
                    .await
                    .ok()
                    .filter(|r| r.exists)
                    .map(|r| r.value)
                    .unwrap_or_else(|| "Provider not yet published".to_string()),
            ),
            _ => HttpResponse::not_found(),
        })
    }
}
```

### Testing locally

Eventually I'll look to run this in production with an HTTP endpoint that Azure can reach, and a persistent data store that is inexpensive, given the lower traffic this app will receive. Thanks to wasmcloud, though, I don't need to decide on any of that yet. Instead, I can use the open source HTTPServer and Redis capability providers to test this actor locally.

Using the [wadm.yaml](https://github.com/brooksmtownsend/ocireffer/blob/main/wadm.yaml) included in my repository, you can deploy this app locally with just a couple of commands, provided you have [wash](https://wasmcloud.com/docs/installation) installed. This will deploy my completed actor, but you can also replace my OCI reference with your own once you publish the actor.

```bash
# Run Redis
redis-server &
# Launch wasmCloud in the background
wash up -d
# Deploy the ocireffer app
wash app deploy ./wadm.yaml
```

After a few seconds, the application will be up-and-running, available on `localhost:8080`. To test it, let's use the full payload that Azure sent my webhook for wash's 0.18.1 release.

```bash
$ curl -X POST -d '{
  "id": "c6fd250a-66bf-4c96-86d0-f33224fe4n40",
  "timestamp": "2023-07-03T14:56:52.0604218Z",
  "action": "push",
  "target": {
    "mediaType": "application/vnd.docker.distribution.manifest.v2+json",
    "size": 2203,
    "digest": "sha256:0116c9dd59ca86bf8069dc8e56c02eb91d1296bbe66b511c279af77cba44d445",
    "length": 2203,
    "repository": "wash",
    "tag": "0.18.1"
  },
  "request": {
    "id": "b7a807f5-e27f-4807-aed6-357ee0568b7b",
    "host": "wasmcloud.azurecr.io",
    "method": "PUT",
    "useragent": "docker/20.10.25+azure-2 go/go1.19.10 git-commit/5df983c7dbe2f8914e6efd4dd6e0083a20c41ce1 kernel/5.15.0-1040-azure os/linux arch/amd64 UpstreamClient(Go-http-client/1.1)"
  }
}' localhost:8080/api/azurehook
Url wasmcloud.azurecr.io/wash:0.18.1 stored for wash
```

And now, we can query the latest OCI reference for wash. This will come out with the shields.io metadata already included, which is good as we'll be displaying this information in a GitHub README.

```bash
$ curl localhost:8080/wash
{"schemaVersion":1,"label":"","message":"wasmcloud.azurecr.io/wash:0.18.1","color":"253746","namedLogo":"wasmcloud"}%
```

## Taking it to Production

Now we've got our actor tested and ready to go with Azure Webhooks. We tested locally using Redis as a key-value store and `curl`, and next we can replace those local capabilities with production-ready providers that a) expose a public HTTP endpoint and b) provide persistent storage. We'll have to save that for part 2, where we'll deploy this on Cosmonic!
