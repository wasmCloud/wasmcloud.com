---
title: "wash scale"
draft: false
sidebar_position: 22
description: "wash scale command reference"
--- 

`wash scale` supports scaling the actors in your lattice to handle concurrent requests. It accepts the host ID on which the actor is running and the reference of the actor to scale as required arguments. It also accepts a `--max-concurrent` value that specifies the maximum number of instances this actor can run concurrently. By default, the value is an unbounded level of concurrency. A value of zero is equivalent to stopping the actor.

### Usage
```
wash scale actor <your-host-id> wasmcloud.azurecr.io/echo:0.3.7
wash scale actor <your-host-id> wasmcloud.azurecr.io/echo:0.3.7 --max-concurrent=20

# Stopping the actor
wash scale actor <your-host-id> wasmcloud.azurecr.io/echo:0.3.7 --max-concurrent=0
```

### Options
`--output` (Alias `-o`) Specify output format (`text` or `json`) [default: `text`]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/using-nats/developer/connecting/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice name for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication

`--max-concurrent` (Alias `-c`) Maximum number of instances this actor can run concurrently. Omitting this value means there is no maximum

`--annotations` (Alias `-a`) Optional set of annotations used to describe the nature of this actor scale command. For example, autonomous agents may wish to “tag” scale requests as part of a given deployment