---
title: "wash capture"
draft: false
sidebar_position: 4
description: "wash capture command reference"
--- 

Wash capture helps in capturing snapshots of the state of a lattice and assists in debugging cluster invocations using operations like replay. This is currently an experimental feature and you would have to pass the `--experimental` flag or set the `WASH_EXPERIMENTAL` environment variable to true. This tool provides three options - enable capture mode, disable capture mode or replay a captured file. A user must first enable capture mode by passing the `--enable` flag. Once capture mode is enabled, a user can capture snapshots at any time by running `wash capture --experimental`, which will download the snapshot file to the current directory. The snapshot files can be viewed by passing the file path to the `replay` subcommand. To disable capture mode, pass the `--disable` flag. 

:::info
This is an experimental command so some features may not work as expected. Please drop a bug fix or feature request in the form of a pull request in our [GitHub repository](https://github.com/wasmCloud/wasmCloud).
:::

### Usage
```
wash capture --enable --experimental
wash capture --experimental
wash capture --disable --experimental
wash capture replay --experimental /path/to/captured-file
```

### Options

`--enable` Enable wash capture. This will setup a NATS JetStream stream to capture all invocations

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--disable` Disable wash capture. This will removed the NATS JetStream stream that was setup to capture all invocations

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--window-size` The length of time in minutes to keep messages in the stream [default: 60]

`--ctl-host` (Alias `-r`) CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

`--ctl-port` CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

`--ctl-jwt` JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

`--ctl-seed` Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

`--ctl-credsfile` Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/using-nats/developer/connecting/creds for details [env: WASH_CTL_CREDS]

`--js-domain` JS domain for wasmCloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

`--lattice-prefix`(Alias `-x`) Lattice name for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--timeout-ms` Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

`--context` Path to a context with values to use for CTL connection and authentication


The following options can be passed for the `replay` subcommand.

`--component-id` A component ID to filter captured invocations by. This will filter anywhere the component is the source or the target of the invocation. If provided with an provider ID, it will filter down to interactions only between the component and provider

`--provider-id` A provider ID to filter captured invocations by. This will filter anywhere the provider is the source or the target of the invocation. If provided with a component ID, it will filter down to interactions only between the component and provider

`--interactive` Whether or not to step through the replay one message at a time