---
title: "wash update"
draft: false
sidebar_position: 27
description: "wash update command reference"
---

`wash update` updates an actor running in a host to a new reference. The user may supply the actor ID, its host ID and the new OCI reference of the actor that needs to replace the actor in this actor ID.

#### Usage
```
wash update actor <host-id> <actor-id> <new-actor-reference>
```

#### Options

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/using-nats/developer/connecting/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice prefix for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication
