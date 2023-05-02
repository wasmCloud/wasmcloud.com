---
title: "Actor Troubleshooting"
date: 2022-01-19T11:02:05+06:00
sidebar_position: 2
draft: false
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Before you follow this section, it's highly recommended to configure your log level to `debug` in order to see the most information when debugging. You can use the [host troubleshooting](./host.md#changing-log-level) section for instructions on how to do this.

When developing actors there are a few often missed steps that can cause your actor to either fail to run or fail to properly operate. Below we'll walk through a few of these scenarios with accompanying error messages.

### Using an insecure registry

```console
Failed to fetch OCI bytes: error sending request for url (https://localhost:5000/v2/): error trying to connect: record overflow
```

This error can happen when attempting to run an actor from the local docker registry included in our examples. If you see this error, you need to set the `WASMCLOUD_OCI_ALLOWED_INSECURE` variable either in your [host config](/docs/hosts/elixir/host_configure) file or as an environment variable. The proper syntax for this is as follows:

<Tabs>
  <TabItem value="unix" label="Unix" default>

```shell
export WASMCLOUD_OCI_ALLOWED_INSECURE=localhost:5000
# Start your host as you did before, either with `mix` for development or the release tarball script
```

  </TabItem>
  <TabItem value="windows" label="Windows Powershell">

```powershell
$env:WASMCLOUD_OCI_ALLOWED_INSECURE = localhost:5000
# Start your host as you did before, either with `mix` for development or the release tarball script
```

  </TabItem>
  <TabItem value="docker" label="Docker">

:::caution
When accessing the local registry from _within_ the docker compose network, you should use `registry:5000` instead of `localhost:5000`. Even though port 5000 is available for you on your local machine to interact with the registry, networking works differently within a compose network and you should use the name of the container instead of localhost. We do the same thing with `nats`, as you can see below.
:::

It's recommended to modify our [sample Docker Compose file](https://raw.githubusercontent.com/wasmCloud/examples/main/docker/docker-compose.yml) to include this variable on the `wasmcloud_host` container. Like so:

```yaml
wasmcloud:
  image: wasmcloud/wasmcloud_host:latest
  environment:
    WASMCLOUD_RPC_HOST: nats
    WASMCLOUD_CTL_HOST: nats
    WASMCLOUD_PROV_RPC_HOST: nats
    WASMCLOUD_OCI_ALLOWED_INSECURE: registry:5000 # Note: we're connecting to the registry container, not localhost, in docker
  ports:
    - "4000:4000"
    - "8080-8089:8080-8089" # Allows exposing examples on ports 8080-8089
```

  </TabItem>
</Tabs>

### Missing Capability Claims

When a wasmCloud actor needs access to a capability provider, we require cryptographically signed claims embedded in that actor. The host runtime operates on a deny-by-default and require claims to be an allow-list to ensure our actors are secure. Adding these capability claims is mostly managed for you with `wash` when you build your actor and the list of capability claims in `wasmcloud.toml` included with any actor project.

This can be illustrated with the `KVCounter` example actor fairly easily. The actor needs to be signed with the `wasmcloud:httpserver` capability to receive HTTP requests, and the `wasmcloud:keyvalue` capability to issue requests to a keyvalue database. Omitting either of these will cause errors due to the inability to receive a request or the inability to issue one, so we'll cover both of those scenarios here.

If the `KVCounter` actor is missing the `wasmcloud:keyvalue` claim, the following operation will fail:

```
let new_val = KeyValueSender::new()
    .increment(ctx, &IncrementRequest { key, value })
    .await?;
```

This bit of code attempts to invoke a keyvalue capability provider, but without that claim the wasmCloud runtime will deny the invocation. Depending on how you invoked that actor, you can check the host logs or the response for an error message like:

```
{"error":"Host send error Invocation not authorized: missing claim for wasmcloud:keyvalue"}
```

If the `KVCounter` actor is missing the `wasmcloud:httpserver` claim, then the following `handle_request` function will be blocked from receiving HTTP requests:

```
impl HttpServer for KvCounterActor {
    async fn handle_request(&self, ctx: &Context, req: &HttpRequest) -> RpcResult<HttpResponse> {
```

This happens at the wasmCloud runtime level when a provider attempts to deliver a HTTPRequest. In this case, wherever you're making this request will return a `500` error, but regardless of the capability you will always be able to find the following in the host logs:

```
[error] Actor does not have proper capabilities to receive this invocation
[error] Invocation failure: actor is missing capability claims
```

### Missing Link Definitions

As shown in the example above, forgetting to sign your actor with capability claims will prevent invocations in both directions for actors. Forgetting a link definition will also prevent invocations, and you'll need to be able to tell the difference between those two scenarios.

Omitting a link between the KVCounter actor and the HTTPServer provider (even if valid claims are present) will result in an `ERR_CONNECTION_REFUSED`. This behavior is specific to the HTTPServer provider as it listens for HTTP requests only on ports that it's configured to, but similar results will happen depending on your provider. If you notice that your request never enters the wasmCloud application, it's likely you are missing a link definition to a provider that serves as an entry point.

Omitting a link between the KVCounter actor and the Redis provider (even if valid claims are present) will give you a similar error message to above as it will result in a denied invocation:

```
{"error":"Host send error Invocation not authorized: missing claim for wasmcloud:keyvalue"}
```

When you see this error, ensure that you've both signed your actor and linked your actor to the appropriate provider.

### Misconfigured Link Definitions

When link definitions are misconfigured, you'll find errors like the ones above for missing link definitions. The host runtime looks at a link definition as a unique binding between an actor and a capability provider on a specific link name to communicate over a specific capability contract. If the actor ID, provider ID, link name, or contract ID are misspelled or omitted then the runtime will deny the invocation as if it does not exist. This is as designed, no typo should be accepted in favor of compromising security.

The command line wasmCloud shell (aka [wash](https://github.com/wasmCloud/wash)) attempts to safeguard against misspellings, though it is unable to determine if a link definition is between the intended actor and provider. If you are establishing a link definition but still see errors that indicate that it's missing, first verify that the link definition specifies the correct actor, provider, link name, and contract ID. You can query all established link definitions in your lattice using `wash ctl link query`.
