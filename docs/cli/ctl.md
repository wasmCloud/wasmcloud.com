---
title: "wash ctl"
draft: false
sidebar_position: 6
description: "wash ctl command reference"
---

This subcommand will help you to interact with the wasmCloud control interface. You may perform operations such as retrieving information about the lattice, enable provisioning or deprovisioning of entities in the lattice, creating links or updating items in the lattice. Following are the subcommands available under `wash ctl`

:::warning
This subcommand will be deprecated in future versions. Please use the following subcommands directly with `wash` instead. For example: `wash get`, `wash link` and so on.
:::

- `get`
- `link`
- `start`
- `stop`
- `update`
- `scale`

## `get`

wash get retrives information about the lattice. The following subcommands will help you retrieve different information available to query:

### `claims`

This subcommand fetches all the known claims inside the lattice.

#### Usage

```
wash ctl get claims
```

### `hosts`

This subcommand fetches all the responsive hosts in the lattice. You may also view the friendly name for all the hosts here.

#### Usage

```
wash ctl get hosts
```

### `inventory`

This subcommand retrieves the inventories of all the hosts in the lattice. To retrieve the inventory of a single host, you may pass the host-id of the desired host.

#### Usage

```
wash ctl get inventory
wash ctl get inventory <your-host-id>
```

#### Options

These options can be used for all of the `wash ctl get` subcommands.

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/developing-with-nats/security/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice prefix for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication

## `link`

This command will assist you to add remove and query all the links in the lattice. Following are the subcommands available in the `wash ctl link`:

- `query`
- `put`
- `del`

### `query`

Queries all the links in the lattice. Links persist in the lattice even if the associated actor or provider are stopped.

#### Usage

```
wash ctl link query
```

### `put`

Adds a link definition in the lattice associated with an actor and provider and having an associated contract. If you want to name the link, you may pass a value to the `--link-name` flag. Be default, the link name is "default".

#### Usage

```
wash ctl link put <actor-id> <provider-id> <contract-id>
```

### `del`

Deletes a link definition in the lattice. If it is named other than "default" the link name can be passed to the `--link-name` flag.

#### Usage

```
wash ctl link del <actor-id> <contract-id>
```

#### Options

These options can be used for all of the `wash ctl link` subcommands.

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/developing-with-nats/security/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice prefix for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication

## `start`

This command helps to start an actor or provider in the the lattice. Following are the available subcommads:

- `actor`
- `provider`

### `actor`

Start an actor by providing its OCI reference. You may specify the host to start this actor on by providing the `--host-id` flag. By default, the actor is auctioned in the lattice for a suitable host.

#### Usage

```
wash ctl start actor wasmcloud.azurecr.io/echo:0.3.7
```

#### Options

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/developing-with-nats/security/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice prefix for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication

`--host-id` Id of host, if omitted the actor will be auctioned in the lattice to find a suitable host

`--max-concurrent` Maximum number of instances this actor can run concurrently. Setting this value to 0 means there is no maximum [default: 1]

`--constraint` (Alias `-c`) Constraints for actor auction in the form of "label=value". If host-id is supplied, this list is ignored

`--auction-timeout-ms` Timeout to await an auction response, defaults to 2000 milliseconds [default: 2000]

`--skip-wait` By default, the command will wait until the actor has been started. If this flag is passed, the command will return immediately after acknowledgement from the host, without waiting for the actor to start. If this flag is omitted, the timeout will be adjusted to 5 seconds to account for actor download times

### `provider`

Start a provider by providing its OCI reference. You may specify the host to start this provider on by providing the `--host-id` flag. By default, the provider is auctioned in the lattice for a suitable host.

#### Usage

```
wash ctl start provider wasmcloud.azurecr.io/httpserver:0.19.1
```

#### Options

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/developing-with-nats/security/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice prefix for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication

`--host-id` Id of host, if omitted the provider will be auctioned in the lattice to find a suitable host

`--link-name` (Alias `-l`) Link name of provider [default: default]

`--constraint` (Alias `-c`) Constraints for provider auction in the form of "label=value". If host-id is supplied, this list is ignored

`--auction-timeout-ms` Timeout to await an auction response, defaults to 2000 milliseconds [default: 2000]

`--config-json` Path to provider configuration JSON file

`--skip-wait` By default, the command will wait until the provider has been started. If this flag is passed, the command will return immediately after acknowledgement from the host, without waiting for the provider to start. If this flag is omitted, the timeout will be adjusted to 30 seconds to account for provider download times

## `stop`

Stop an actor provider or a host. Following are the available subcommands:

- `actor`
- `provider`
- `host`

### `actor`

Stop an actor running in a host

#### Usage

```
wash ctl stop actor <host-id> <actor-id>
```

### `provider`

Stop a provider running in a host

#### Usage

```
wash ctl stop provider <host-id> <actor-id> <link-name> <contract-id>
```

### `host`

Purge and stop a running host. You may pass the `--host-timeout` flag to specify the time to give the host for a graceful shutdown. By default it is 2000 ms.

#### Usage

```
wash ctl stop host <host-id>
```

#### Options

The following options can be used for all subcommands of `wash ctl stop`.

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/developing-with-nats/security/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice prefix for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication

`--skip-wait` By default, the command will wait until the actor/provider has been started. If this flag is passed, the command will return immediately after acknowledgement from the host, without waiting for the provider to start. If this flag is omitted, the timeout will be adjusted to 30 seconds to account for provider download times and 5 seconds to account for actor download times.

## `update`

Update an actor running in a host to a new reference

#### Usage

```
wash ctl update actor <host-id> <actor-id> <new-actor-reference>
```

#### Options

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/developing-with-nats/security/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice prefix for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication

## `scale`

This command supports scaling the actors in your lattice to handle concurrent requests. It accepts the host ID on which the actor is running and the reference of the actor to scale as required arguments. It also accepts a `--max-concurrent` value that specifies the maximum number of instances this actor can run concurrently. By default, the value is an unbounded level of concurrency. A value of zero is equivalent to stopping the actor.

#### Usage

```
wash ctl scale actor <your-host-id> wasmcloud.azurecr.io/echo:0.3.7
wash ctl scale actor <your-host-id> wasmcloud.azurecr.io/echo:0.3.7 --max-concurrent=20
```

#### Options

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/developing-with-nats/security/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice prefix for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication

`--max-concurrent`(Alias `-c`) Maximum number of instances this actor can run concurrently. Omitting this value means there is no maximum

`--annotations` (Alias `-a`) Optional set of annotations used to describe the nature of this actor scale command. For example, autonomous agents may wish to “tag” scale requests as part of a given deployment
