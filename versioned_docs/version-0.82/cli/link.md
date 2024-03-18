---
title: "wash link"
draft: false
sidebar_position: 15
description: "wash link command reference"
--- 

This command will assist you to add remove and query all the links in the lattice. Following are the subcommands available in `wash link`:

- `query`
- `put`
- `del`

### `query`
Queries all the links in the lattice. Links persist in the lattice even if the associated actor or provider are stopped.

#### Usage
```
wash link query
```

### `put`
Adds a link definition in the lattice associated with an actor and provider and having an associated contract. If you want to name the link, you may pass a value to the `--link-name` flag. Be default, the link name is "default".

#### Usage
```
wash link put <actor-id> <provider-id> <contract-id>
```

### `del`
Deletes a link definition in the lattice. If it is named other than "default" the link name can be passed to the `--link-name` flag.

#### Usage
```
wash link del <actor-id> <contract-id>
```

#### Options
These options can be used for all of the `wash link` subcommands. 

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
