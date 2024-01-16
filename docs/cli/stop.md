---
title: "wash stop"
draft: false
sidebar_position: 24
description: "wash stop command reference"
--- 

`wash stop` allows you to stop an actor, provider or a host. The user may specify if they want to stop an actor or a provider and pass the OCI reference of that entity to the command. To specify a host to stop the actor or provider, pass the host ID using the `--host-id` flag. Following are the available subcommads:

- `actor`
- `provider`
- `host`


### `actor`
Stop an actor running in a host 

#### Usage
```
wash stop actor <host-id> <actor-id>
```

### `provider`
Stop a provider running in a host 

#### Usage
```
wash stop provider <host-id> <actor-id> <link-name> <contract-id>
```

### `host`
Purge and stop a running host. You may pass the `--host-timeout` flag to specify the time to give the host for a graceful shutdown. By default it is 2000 ms.

#### Usage
```
wash stop host <host-id>
```

#### Options
The following options can be used for all subcommands of `wash stop`.

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

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

`--skip-wait` By default, the command will wait until the actor/provider has been started. If this flag is passed, the command will return immediately after acknowledgement from the host, without waiting for the provider to start. If this flag is omitted, the timeout will be adjusted to 30 seconds to account for provider download times and  5 seconds to account for actor download times.

