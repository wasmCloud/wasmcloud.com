---
title: "Host Troubleshooting"
date: 2022-01-19T11:02:05+06:00
sidebar_position: 1
draft: false
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Host troubleshooting largely revolves around checking host logs and determining the issue from there. With wasmCloud we aim to log relevant information so that you can diagnose the source of the problem.

The primary wasmCloud host runtime is the [wasmCloud](https://github.com/wasmCloud/wasmCloud/tree/main/crates/host) host, and this is what you'll be using if you're running the host from the release tarball or with the [wasmcloud](https://hub.docker.com/r/wasmcloud/wasmcloud) docker image. The Javascript host has different log messages and it's recommended to create an issue [here](https://github.com/wasmCloud/wasmcloud-js/issues/new) if you are running into errors in the browser.

The wasmCloud host logs include the following:

1. Logs from the host runtime
1. Logs from capability providers that emit to stdout
1. Logs from actors that utilize the `wasmcloud:builtin:logging` capability

## Finding the logs (release tarball)

If you followed the [installation](/docs/installation) guide then you likely started the host by running a command like `wash up` or `wash up --detached`. If you ran the host using `wash up` the logs will be printed to the screen, otherwise they will be located in the `~/.wash/downloads` directory.

If you take a look at the top of one of these logfiles (using `head` for example on Unix systems) you'll see something like:

```console
=====
===== LOGGING STARTED Tue Jan 18 16:15:11 EST 2022
=====
Erlang/OTP 24 [erts-12.0.3] [source] [64-bit] [smp:10:10] [ds:10:10:10] [async-threads:1]

16:15:22.532 [info] Wrote "./host_config.json"
16:15:22.549 [info] Wrote "/my/user/.wash/host_config.json"
16:15:22.549 [info] Connecting to control interface NATS without authentication
16:15:22.549 [info] Connecting to lattice rpc NATS without authentication
```

The `Erlang/OTP` line is useful for submitting issues, but what you're likely interested in is the end of the log file where logs are being constantly appended. This is where you'll want to look for any errors.

## Finding the logs (docker)

If you followed the [installation with docker](/docs/installation?os=docker) guide, then you'll be running the wasmCloud host inside of a Docker container. It's fairly simple to get the logs from here.

First, find the name of the wasmCloud host container:

```console
docker ps -a --format "table {{.Image}}\t{{.Names}}"
```

```console
IMAGE                             NAMES
wasmcloud/wasmcloud_host:latest   tmp-wasmcloud-1
registry:2.7                      tmp-registry-1
redis:6.2                         tmp-redis-1
nats:2.7.2-alpine                 tmp-nats-1
```

Then, attach your terminal to the logs of that container (in this case, `tmp-wasmcloud-1`):

```console
$ docker logs -f tmp-wasmcloud-1
15:51:06.582 [info] Wrote "./host_config.json"
15:51:06.582 [info] Wrote "/root/.wash/host_config.json"
15:51:06.582 [info] Connecting to control interface NATS without authentication
15:51:06.582 [info] Connecting to lattice rpc NATS without authentication
15:51:06.582 [info] Starting wasmCloud OTP Host Runtime v0.52.1
...
```

## Changing log level

At the time of writing this, the main wasmCloud host runtime is an Elixir/OTP application and actors and providers both are written in Rust. Both of these components have adjustable log levels.

### Elixir + Actors

Elixir supports log levels of `error`, `warn`, `info`, and `debug`. You'll need to set the log level before you launch the host by setting the environment variable `WASMCLOUD_LOG_LEVEL` to one of the supported log level.

For example, running `WASMCLOUD_LOG_LEVEL=debug wash up` will show the most verbose logs.

### Rust Capability Providers

Changing the log level for capability providers requires setting the `RUST_LOG` environment variable.

You can either export the `RUST_LOG=<log_level>` environment variable in the same terminal that you launch the host, or you can use the integrated Elixir terminal to change the verbosity at runtime. Refer to the steps in the above section to connect to the integrated terminal, and then run the following command to set the environment variable:

```elixir
System.put_env("RUST_LOG", "debug")
```

Rust supports log levels of `error`, `warn`, `info`, `debug`, and `trace`, and you can replace the second argument in the function above with any of those levels.
