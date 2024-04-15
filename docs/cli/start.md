---
title: "wash start"
draft: false
sidebar_position: 23
description: "wash start command reference"
---

`wash start` assists in launching a component or a provider from an OCI reference on a host. The user may specify if they want to start a component or a provider and pass the OCI reference of that entity to the command. By default, the component or provider are auctioned in the lattice for a suitable host. To specify a host to launch the component or provider, pass the host ID using the `--host-id` flag. Components or providers can also be started from local files using the prefix `file://` followed by the file path. By default, loading from files is permitted when you start the host using `wash up` and can be disabled using the `WASMCLOUD_ALLOW_FILE_LOAD` environment variable. If the host is started from the binary instead of `wash up`, loading from files is disabled. Following are the available subcommads under `wash start`:

- `component`
- `provider`

#### Usage

```
wash start component wasmcloud.azurecr.io/echo:0.3.7

wash start component file://<path-to-component>

wash start provider wasmcloud.azurecr.io/httpserver:0.19.1

wash start provider file://<path-to-provider>
```

#### Options

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` (Alias `-p`) CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See <https://docs.nats.io/developing-with-nats/security/creds> for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix` (Alias `-x`) Lattice name for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` (Alias `-t`) Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication

`--host-id` ID of host, if omitted the applicationcomponent will be auctioned in the lattice to find a suitable host

`--max-concurrent` Maximum number of instances this component can run concurrently. Setting this value to 0 means there is no maximum [default: 1]

`--constraint` (Alias `-c`) Constraints for application component auction in the form of "label=value". If host-id is supplied, this list is ignored

`--auction-timeout-ms` Timeout to await an auction response, defaults to 2000 milliseconds [default: 2000]

`--skip-wait` By default, the command will wait until the component has been started. If this flag is passed, the command will return immediately after acknowledgement from the host, without waiting for the component to start. If this flag is omitted, the timeout will be adjusted to 30 seconds to account for provider download times and 5 seconds to account for component download times.
