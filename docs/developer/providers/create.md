---
title: 'Create'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 1
draft: false
---

The first step in creating our new provider is to generate a new project from a template. We provide an example template to generate a capability provider that has scaffolding to implement the `wasmcloud:messaging` interface. This page will walk you through generating this capability provider and then implementing the functionality using [NATS](https://nats.io).

:::info[Dependencies]
To create this capability provider you'll need to install [wash](/docs/installation.mdx), the [Rust toolchain](https://www.rust-lang.org/tools/install), and `wit-bindgen-wrpc` (available by running `cargo install wrpc` or as a [release binary](https://github.com/bytecodealliance/wrpc/releases) in the `wrpc` repo). After implementing, you'll also want the [nats CLI](https://github.com/nats-io/natscli) to send your provider messages.
:::

## The messaging interface

This capability provider will _provide_ the functionality for the `wasmcloud:messaging` interface. Interfaces are defined in WebAssembly Interface Type (WIT)&mdash;if you're new to WIT, see the [Interfaces](/docs/developer/interfaces/creating-an-interface) section for an introduction to WIT, worlds, interfaces, imports and exports, and how all of these concepts tie together.

Let's take a look at the [WIT for this interface](https://github.com/wasmCloud/messaging):

```wit
package wasmcloud:messaging@0.2.0;

// Types common to message broker interactions
interface types {
    // A message sent to or received from a broker
    record broker-message {
        subject: string,
        body: list<u8>,
        reply-to: option<string>,
    }
}

interface handler {
    use types.{broker-message};

    // Callback handled to invoke a function when a message is received from a subscription
    handle-message: func(msg: broker-message) -> result<_, string>;
}

interface consumer {
    use types.{broker-message};

    // Perform a request operation on a subject
    request: func(subject: string, body: list<u8>, timeout-ms: u32) -> result<broker-message, string>;
    // Publish a message to a subject without awaiting a response
    publish: func(msg: broker-message) -> result<_, string>;
}
```

This interface defines two interfaces, `handler` and `consumer`, in order to give a component the ability to send and receive messages. In a nutshell, this is a pubsub messaging capability.

## Generate

First, generate the capability provider project:

```bash
wash new provider messaging-nats --template-name messaging-nats
```

Feel free to take a look around the provider project. The important files are:

1. `src/nats.rs`: We're going to be primarily implementing functionality here.
1. `wasmcloud.toml`: Build information and metadata for the provider
1. `wit/provider.wit`: The [interface](/docs/concepts/interfaces) this provider implements and uses

## Implementing the interface

This capability provider uses `wasmcloud:messaging` and `import`s the `handler` interface and `export`s the `consumer` interface. Take a look at the wit under `wit/provider.wit` for this provider:

```wit
package wasmcloud:provider-messaging-nats;

world provider-messaging-nats {
    import wasmcloud:messaging/handler@0.2.0;
    export wasmcloud:messaging/consumer@0.2.0;
}
```

For each `import` in the provider's `world`, you'll use an external trigger in order to invoke that function on a WebAssembly component dynamically at runtime. Here we import the `handler` interface, and we're going to invoke a [linked](/docs/concepts/linking-components/) component any time we receive a message on a NATS subscription.

For each `export` in the provider's `world`, you'll need to implement a function to handle the functionality of that interface. WebAssembly components will be able to invoke exported functions dynamically at runtime. Here, we export the entire `consumer` interface, so we'll need to implement the `publish` and `request` functionality in the provider.

## Implementing imports

As mentioned above, an import is a function that a provider will invoke on a WebAssembly component. We can start with the `wasmcloud:messaging/handler.handle-message` import and, by the end of this section, we'll be invoking a component in response to a NATS message.

We're going to implement the `dispatch_msg` function about halfway down in `src/nats.rs`. In place of the TODO, we'll use the generated interface function for `wasmcloud::messaging::handler::handle_message`, with the wRPC client, to invoke a component:

```rust
async fn dispatch_msg(component_id: &str, nats_msg: async_nats::Message) {
    let msg = BrokerMessage {
        body: nats_msg.payload.into(),
        reply_to: nats_msg.reply.map(|s| s.to_string()),
        subject: nats_msg.subject.to_string(),
    };
    debug!(
        subject = msg.subject,
        reply_to = ?msg.reply_to,
        component_id = component_id,
        "sending message to component",
    );

    // TODO: Send the message to the component's `wasmcloud:messaging/handler.handle-message` function //[!code --]
    todo!("Use wasmcloud:messaging/handler for NATS provider") // [!code --]
    if let Err(e) = wasmcloud::messaging::handler::handle_message( // [!code ++]
        &get_connection().get_wrpc_client(component_id), // [!code ++]
        &msg, // [!code ++]
    ) // [!code ++]
    .await // [!code ++]
    { // [!code ++]
        error!( // [!code ++]
            error = %e, // [!code ++]
            "Unable to send message" // [!code ++]
        ); // [!code ++]
    } // [!code ++]
}
```

Each `import` in your provider's WIT interface will generate a function like this for you to call at runtime. The `get_connection` function is provided as a part of the `wasmcloud-provider-sdk` crate, and is a helper function to retrieve the RPC client for component communication.

## Implementing exports

An `export` is a function that your provider will implement that components will call at runtime. At the bottom of `src/nats.rs`, you'll see we have an empty implementation for both `export` functions in the WIT, `publish` and `request`. The `Handler` trait is generated directly from the WIT interface, so an implementer of the `Handler` trait _must_ implement both of these functions. For this step, we can use the `async-nats` crate to implement publish and request functionality.

```rust
/// Components will call this function to publish a message to a subject
async fn publish(
    &self,
    ctx: Option<Context>,
    msg: BrokerMessage,
) -> anyhow::Result<Result<(), String>> {
    // [!code ++:26]
    // Retrieve the NATS client for the component
    let nats_client =
        if let Some(ref source_id) = ctx.and_then(|Context { component, .. }| component) {
            let components = self.components.read().await;
            let nats_bundle = match components.get(source_id) {
                Some(nats_bundle) => nats_bundle,
                None => {
                    error!("component not linked: {source_id}");
                    bail!("component not linked: {source_id}")
                }
            };
            nats_bundle.client.clone()
        } else {
            error!("component did not make request");
            bail!("component did not make request")
        };

    // Publish the message
    let res = nats_client
        .publish(msg.subject.to_string(), msg.body.into())
        .await
        .map_err(|e| e.to_string());
    // (Optional) Flush the NATS client to ensure the message is sent
    let _ = nats_client.flush().await;
    Ok(res)
}
```

After retrieving the NATS client that is configured for the requesting component, we can simply `publish` the message to the provided subject and return the result. An optional recommended step is included to flush the NATS client after publishing, which ensures that the message is sent immediately and improves performance.

:::info
We created the NATS client for the requesting component inside of the `receive_link_config_as_target` function provided by the provider SDK. At runtime, when a component [links](/docs/concepts/linking-components/) to this capability provider, it will provide configuration for connecting to a NATS server. Check the implementation of that function to see how we use that configuration to create and store a client for lookups later.
:::

Next we can do a similar step for implementing `request`:

```rust
/// Components will call this function to publish a message to a subject and expect
/// a response back
async fn request(
    &self,
    ctx: Option<Context>,
    subject: String,
    body: Vec<u8>,
    _timeout_ms: u32,
) -> anyhow::Result<Result<BrokerMessage, String>> {
    // [!code ++:31]
    // Retrieve the NATS client for the component
    let nats_client =
        if let Some(ref source_id) = ctx.and_then(|Context { component, .. }| component) {
            let components = self.components.read().await;
            let nats_bundle = match components.get(source_id) {
                Some(nats_bundle) => nats_bundle,
                None => {
                    error!("component not linked: {source_id}");
                    bail!("component not linked: {source_id}")
                }
            };
            nats_bundle.client.clone()
        } else {
            error!("component did not make request");
            bail!("component did not make rrequest")
        };

    // Publish the message
    let res = nats_client
        .request(subject.to_string(), body.into())
        .await
        .map(|msg| BrokerMessage {
            body: msg.payload.to_vec(),
            reply_to: msg.reply.map(|s| s.to_string()),
            subject: msg.subject.to_string(),
        })
        .map_err(|e| e.to_string());
    // (Optional) Flush the NATS client to ensure the message is sent
    let _ = nats_client.flush().await;
    Ok(res)
}
```

We perform the same steps to fetch the NATS client, and instead of publishing a message we make a request and map the response into the type the component is expecting, a `BrokerMessage`. Note here that we did not use the `timeout_ms` argument, and there's some duplicated logic here for retrieving a NATS client. If you're looking to improve this code, try refactoring it to remove duplication and implement the timeout for the request.

## Testing the provider

Now that you've implemented all of the `import` and `export` functions for this provider, it's ready to test. Inside of the project directory you can run `wash build` to compile and package your provider into a provider archive. For more information on building, check out the [build](./build.md) page. We'll use a prebuilt wasmCloud example component that uses `wasmcloud:messaging` to test this provider.

To generate the example component, use the following command. You can do this inside of your current project directory or as a separate folder:

```bash
wash new component --git wasmcloud/wasmcloud --subfolder examples/rust/components/echo-messaging echo
```

This component is fairly simple, it `export`s the same function that the provider `import`s, `wasmcloud:messaging/handler.handle-message`, and it `import`s the same function the provider `export`s, `wasmcloud:messaging/consumer.publish`. We'll use a declarative manifest to link this component and our provider together at runtime.

```rust
impl Guest for Echo {
    fn handle_message(msg: types::BrokerMessage) -> Result<(), String> {
        if let Some(reply_to) = msg.reply_to {
            consumer::publish(&types::BrokerMessage {
                subject: reply_to,
                reply_to: None,
                body: msg.body,
            })
        } else {
            log(
                Level::Warn,
                "",
                "No reply_to field in message, ignoring message",
            );
            Ok(())
        }
    }
}
```

Edit the application manifest, `wadm.yaml`, to point to your built provider archive. The below example assumes that you generated the component in a subfolder of your capability provider directory. You can also use absolute paths to remove any ambiguity:

```yaml
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: rust-echo-messaging
  annotations:
    version: v0.0.1
    description: "Echo demo in Rust, using the WebAssembly Component Model and WebAssembly Interfaces Types (WIT)"
spec:
  components:
    - name: echo
      type: component
      properties:
        image: file://./build/echo_messaging_s.wasm
      traits:
        # Govern the spread/scheduling of the component
        - type: spreadscaler
          properties:
            instances: 1
        - type: link
          properties:
            target: nats
            namespace: wasmcloud
            package: messaging
            interfaces: [consumer]
            target_config:
              - name: simple-subscription
                properties:
                  subscriptions: wasmcloud.echo

    # Add a capability provider that implements `wasmcloud:messaging` using NATS
    - name: nats
      type: capability
      properties:
        image: ghcr.io/wasmcloud/messaging-nats:canary // [!code --]
        image: file://../build/wasmcloud-example-messaging-nats.par.gz // [!code ++]
```

Next, start up a wasmCloud host if you don't have one already:

```bash
wash up -d
```

And finally, deploy your application:

```bash
cd echo
wash app deploy wadm.yaml
```

In a few moments, the example component and your provider will be deployed. You can verify this worked by checking the inventory of the host:

```bash
> wash get inventory

  Host Inventory (NC77TD43XRWDLTEA2DV4JHJCNT65QNOQEUKTSDJKIB4KSSIDM7FQ5EM6)

  zone                        us-west-1
  hostcore.osfamily           unix
  hostcore.os                 macos
  hostcore.arch               aarch64

  Component ID                Name               Image Reference
  rust_echo_messaging-echo    echo-messaging     file:///tmp/messaging-nats/echo/build/echo_messaging_s.wasm

  Provider ID                 Name               Image Reference
  rust_echo_messaging-nats    Messaging NATS     file:///tmp/messaging-nats/build/wasmcloud-example-messaging-nats.par.gz
```

Using the NATS CLI, try sending your component a message! You should get back whatever you sent as a payload in the request.

```bash
➜ nats req "wasmcloud.echo" "helloooo"
15:37:50 Sending request on "wasmcloud.echo"
15:37:50 Received with rtt 2.025916ms
helloooo
```

## Conclusion

This guide walks through the process of building a capability provider using a standard interface, `wasmcloud:messaging`. You can use this guide and this example as an outline for how you would implement `wasmcloud:messaging` for a different pubsub system, [like Kafka](https://github.com/wasmCloud/wasmCloud/tree/main/crates/provider-messaging-kafka), or you could use it as a reference for implementing a different standard interface like `wasi:keyvalue`, `wasi:http`, etc. The process is exactly the same for custom interfaces, simply update your WIT interface file with the functions that satisfy your interface, and then use the [wasmcloud-provider-sdk](https://crates.io/crates/wasmcloud-provider-sdk) library to generate types and functions for you to implement.
