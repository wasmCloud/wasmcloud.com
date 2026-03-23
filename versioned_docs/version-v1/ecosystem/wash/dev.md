---
title: 'wash dev'
date: '2025-03-27T14:51:08.210Z'
draft: false
sidebar_position: 5
description: 'Using wash dev'
---

`wash dev` is a subcommand that makes it easy to iteratively develop wasmCloud projects.

Thanks to the unique features of WebAssembly, WIT, and wasmCloud `wash dev` enables quick development feedback loops by:

- Building your project
- Starting a local wasmCloud host
- Resolving and running local versions of dependencies like providers where possible
- Deploying your application
- Reloading (and redeploying) your application on local code changes.

:::tip

Check out our [Blog Post on `wash dev`](https://wasmcloud.com/blog/2025-01-21-wash-dev-wasmclouds-rapid-developer-loop-for-webassembly-projects/)

:::

## `wash dev` Quickstart

:::info[Prerequisites]
This tutorial assumes you already have `wash` installed. If you don't, refer to the [**installation instructions**](/docs/installation.mdx) first.
:::

Here's a quick guide to getting started with wasmCloud and `wash dev`.

First, run `wash new` to scaffold a new project:

```console
wash new component wdev
```

After selecting what kind of project you'd like to build, you should see output like the following:

```
➜ wash new component wdev
✔ Select a project template: · hello-world-rust: a hello-world component (in Rust) that responds over an HTTP connection
🔧 Cloning template from repo wasmCloud/wasmCloud subfolder examples/rust/components/http-hello-world...
🔧 Using template subfolder examples/rust/components/http-hello-world...
🔧 Generating template...
✨ Done! New project created /tmp/wdev

Project generated and is located at: /tmp/wdev
```

Next, change into the directory that was created:

```console
cd wdev
```

You should *immediately* be able to run `wash dev` and build the project:

```console
wash dev
```

You should see output similar to the following:

```
ℹ️  Resolved wash session ID [ATYO9I]
🚧 Starting a new host...
👀 Found nats-server version on the disk: nats-server: v2.10.20
🎣 Downloading new nats-server from https://github.com/nats-io/nats-server/releases/download/v2.10.26/nats-server-v2.10.26-linux-amd64.tar.gz
🎯 Saved nats-server to /home/user/.wash/downloads/nats-server
ℹ️  NATS server successfully started, using config @ [/home/user/.wash/downloads/nats.conf]
ℹ️  NATS server logs written to [/home/user/.wash/dev/ATYO9I/nats.log]
👀 Found wadm version on the disk: wadm 0.20.3
🎣 Downloading new wadm from https://github.com/wasmcloud/wadm/releases/download/v0.21.0/wadm-v0.21.0-linux-amd64.tar.gz
🎯 Saved wadm to /home/user/.wash/downloads/wadm
✅ Successfully started host, logs writing to /home/user/.wash/dev/ATYO9I/wasmcloud.log
>>> ⠍⠀ Building project...                                                                                                                                                                                                                        Compiling proc-macro2 v1.0.93
    # .... build logs truncated ...
     Finished `release` profile [optimized] target(s) in 5.74s
✅ Successfully built project at [/tmp/wdev/build/http_hello_world_s.wasm]
ℹ️  Detected component dependencies: {"http-server"}
🔁 Reloading component [ATYO9I-http-hello-world]...
🔁 Deployed updated manifest for application [dev-atyo9i-http-hello-world]
✨ HTTP Server: Access your application at http://127.0.0.1:8000
👀 Watching for file changes (press Ctrl+c to stop)...

```

`wash dev` won't return, but if you're working on an example like a HTTP server, it will tell you where you can access the running application (in this case, `http://127.0.0.1:8000`, AKA `localhost:8000`).

`wash dev` did the work of starting wasmCloud, a HTTP provider, your component, and hooking all of the pieces up so you could simply `curl localhost:8000`:

```
$ curl localhost:8000
Hello from Rust!
```

## Configuring `wash` (and `wash dev`)

Configuration for `wash` is stored in `wasmcloud.toml`. While template projects contain basic options, there are many more to consider. 

See [the `wasmcloud.toml` config reference][reference-toml-config] for more information.

[reference-toml-config]: /docs/v1/reference/config
