---
title: "wash get"
draft: false
sidebar_position: 11
description: "wash get command reference"
--- 

Wash get helps you in retrieving information about your lattice. It can help you retrieve all the links in the lattice, hosts, their inventories and claims. Following are the subcommands available under `wash get`:

- `links`
- `hosts`
- `inventory`
- `claims`

### `links`

This subcommand will retrieve all the known links in the lattice. It will give you information about them such as the link name, the associated component and provider ID and its contract ID.

#### Usage
```
wash get links
```

### `hosts`

This subcommand retrieves all the hosts currently running in the lattice. You will be able to view each hosts host ID and its uptime.

#### Usage

```
wash get hosts
```

### `inventory`

This subcommand queries the inventory for all the hosts running in the lattice. You may retrieve the inventory for a single host by passing that host's ID as an argument.

#### Usage

```
wash get inventory
wash get inventory <your-host-ID>
```

### `claims`

This subcommand queries the lattice for its claims cache. It retrieves the issuer, subject, associated capabilities, version and revision for all the claims.

#### Usage

```
wash get claims
```


#### Options
The following options can be used for all subcommands under `wash get`:

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/developing-with-nats/security/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice name for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication