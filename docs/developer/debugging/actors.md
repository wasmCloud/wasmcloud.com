---
title: "Actor Troubleshooting"
date: 2022-01-19T11:02:05+06:00
sidebar_position: 2
draft: false
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

- [Prerequisites](#prerequisites)
- [Common Errors](#common-errors)
  - [Using an insecure registry](#using-an-insecure-registry)
  - [Missing Capability Claims](#missing-capability-claims)
  - [Missing Link Definitions](#missing-link-definitions)
  - [Misconfigured Link Definitions](#misconfigured-link-definitions)
- [Debugging Actor/Provider communication](#debugging-actorprovider-communication)
  - [`wash spy`](#wash-spy)
  - [`wash capture`](#wash-capture)
    - [Using a washcapture file](#using-a-washcapture-file)


## Prerequisites

Before you follow this section, it's highly recommended to configure your log level to `debug` in
order to see the most information when debugging. You can use the [host
troubleshooting](./host.md#changing-log-level) section for instructions on how to do this.

When developing actors there are a few often missed steps that can cause your actor to either fail
to run or fail to properly operate. Below we'll walk through a few of these scenarios with
accompanying error messages.

## Common Errors

### Using an insecure registry

```console
Failed to fetch OCI bytes: error sending request for url (https://localhost:5000/v2/): error trying to connect: record overflow
```

This error can happen when attempting to run an actor from the local docker registry included in our examples. If you see this error, you need to set the `WASMCLOUD_OCI_ALLOWED_INSECURE` variable either in your [host config](/docs/hosts/elixir/host-configure) file or as an environment variable. The proper syntax for this is as follows:

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

When link definitions are misconfigured, you'll find errors like the ones above for missing link definitions. The host runtime looks at a link definition as a unique binding between an actor and a capability provider on a specific link name to communicate over a specific capability contract.

The command line wasmCloud shell (aka [wash](https://github.com/wasmCloud/wash)) attempts to safeguard against misspellings, though it is unable to determine if a link definition is between the intended actor and provider. If the actor ID, provider ID, link name, or contract ID are misspelled or omitted then the runtime will deny the invocation as if it does not exist. This is as designed, no typo should be accepted in favor of compromising security.

If you are establishing a link definition but still see errors that indicate that it's missing, first verify that the link definition specifies the correct actor, provider, link name, and contract ID. You can query all established link definitions in your lattice using `wash get link`.

:::info
Previous guides used `wash ctl link query`, which is now deprecated and will be removed in a future version.
See [the wash command refactoring RFC](https://github.com/wasmCloud/wash/issues/538) for more information and to provide feedback
:::

## Debugging Actor/Provider communication

### `wash spy`

As of wash 0.18, there is a new experimental debugging command called `wash spy`. This command
allows you to see all messages sent between actors and providers, and is useful for debugging
communication issues. To use it, you'll need to enable experimental mode for wash:

```shell
export WASH_EXPERIMENTAL=true
```

Then, you can run `wash spy` to see all messages sent between actors and providers. 

```shell
$ wash spy <actor name or ID>
```

You can pass the actual actor ID if you wish, but for ease of use  wash
will attempt to resolve it to an ID by checking if the `actor_name` or `call_alias` fields from the
actor's claims contains the given string. If more than one matches, then an error will be returned
indicating the options to choose from. Note that this matching is case-insensitive.

You can try out this command with the KV Counter example:

```shell
$ wget https://raw.githubusercontent.com/wasmCloud/examples/main/actor/kvcounter/wadm.yaml
$ wash app put wadm.yaml

Successfully put manifest
$ wash app deploy kvcounter

Deployed model
$ wash spy kvcounter

Spying on actor kvcounter

[2023-06-21 11:24:32.397138 -06:00]
From: HTTP Server              To: kvcounter                Host: NC7XZN5VJW2EOK6E565MSRY3JW2WU5ABUA6HTSPY6O7MVKGZTFCR3TDM

Operation: HttpServer.HandleRequest
Message: {
  "method": "GET",
  "path": "/api/counter",
  "queryString": "",
  "header": {
    "host": [
      "127.0.0.1:8081"
    ],
    "user-agent": [
      "curl/7.88.1"
    ],
    "accept": [
      "*/*"
    ]
  },
  "body": []
}

[2023-06-21 11:24:32.407787 -06:00]
From: kvcounter                To: Redis KeyValue Store     Host: CB6S44L4Q5IIRD4BJGQXN5TJXF4YFJXD5DOYBZOYRJP5U2GEZFKXNGD4

Operation: KeyValue.Increment
Message: {
  "key": "counter:default",
  "value": 1
}
```

This output has the timestamp the invocation was observed at, the source and target of the
invocation, and the content of the invocation itself. Wash spy will attempt to decode the invocation
and output it to JSON, but if it is unable to, it will output the raw bytes instead.

### `wash capture`

As of wash 0.18, there is a new experimental debugging command called `wash capture`. This command
enables you to debug an issue after it occurs by capturing a window of all invocations in the
lattice (1 hour by default). A helpful comparison is that this is similar to many gaming tools that
constantly capture your video while you game, and then at a press of a button you can save the last
60s for later usage/reply. This is useful for debugging issues that are difficult to reproduce, or
for debugging issues that occur in production. Right now, the functionality is extremely simple, but
if the community finds it useful, we plan on adding even more useful features to it.

To use it, you'll need to enable experimental mode for wash and then enable capture mode for your
lattice:

```shell
$ export WASH_EXPERIMENTAL=true
$ wash capture --enable
```

By default, this will set up a sliding capture window of 1 hour (any invocations older than 1 hour
will be deleted). You can change this by passing the `--window-size` flag. For example, to set up a
window of 5 minutes, you can run:

```shell
wash capture --enable --window-size 5
```

Once you run into a bug, you can capture the last window of invocations by running:

```shell
$ wash capture
No messages received in the last second. Ending capture

Completed capture and output to file 2023-06-14T11:11:03.476732-06:00.default.washcapture
```

This command will run until it detects a message that is past the time you started the capture, or
no new messages appear for 1s (whichever comes first). It will then output a file that contains all
the messages that occurred in the last window along with a dump of all hosts in the lattice with
their inventory. Please note that the file has a `.washcapture` extension, but it is just a normal
tarball file; however, the structure of the tarball is not a publicly supported contract (meaning
you shouldn't try building tooling off of its structure). The filename will always be of the form
`<rfc3339 timestamp>.<lattice-prefix>.washcapture`.

#### Using a washcapture file

You can use the `wash capture replay` command to replay a washcapture file. For example, if you have
a file called `2023-06-14T11:11:03.476732-06:00.default.washcapture`, you can replay it by running:

```shell
$ wash capture replay 2023-06-14T11:11:03.476732-06:00.default.washcapture
```

This command will output all invocations in the order they were received. The output will look
similar to below:

```
[2023-06-14 17:10:15.131165 +00:00:00]
From: VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M  To: MCFMFDWFHGKELOXPCNCDXKK5OFLHBVEWRAOXR5JSQUD2TOFRE3DFPM7E  Host: NC7XZN5VJW2EOK6E565MSRY3JW2WU5ABUA6HTSPY6O7MVKGZTFCR3TDM

Operation: HttpServer.HandleRequest
Message: {
  "method": "GET",
  "path": "/api/counter",
  "queryString": "",
  "header": {
    "host": [
      "127.0.0.1:8081"
    ],
    "user-agent": [
      "curl/7.88.1"
    ],
    "accept": [
      "*/*"
    ]
  },
  "body": []
}

[2023-06-14 17:10:15.151724 +00:00:00]
From: MCFMFDWFHGKELOXPCNCDXKK5OFLHBVEWRAOXR5JSQUD2TOFRE3DFPM7E  To: VAZVC4RX54J2NVCMCW7BPCAHGGG5XZXDBXFUMDUXGESTMQEJLC3YVZWB  Host: CB6S44L4Q5IIRD4BJGQXN5TJXF4YFJXD5DOYBZOYRJP5U2GEZFKXNGD4

Operation: KeyValue.Increment
Message: {
  "key": "counter:default",
  "value": 1
}
```

This output has the timestamp the invocation was observed at, the source and target of the
invocation, and the content of the invocation itself. Wash spy will attempt to decode the invocation
and output it to JSON, but if it is unable to, it will output the raw bytes instead. Because this
can be done offline, it does not attempt to fetch friendly names for each of the providers and
actors like what is done in `wash spy`. 

You can also filter the output by passing the `--provider-id` and `--actor-id` flags. If you pass
just one of the flags, it will filter all invocations that were set to or from that actor/provider.
If both flags are passed, it will only output invocations between that actor and provider

Lastly, there is an interactive mode that works similar to stepping through a debugger. This can be
enabled by passing the `--interactive` flag. You can then step through each invocation by pressing
the Enter key.
