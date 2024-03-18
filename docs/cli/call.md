---
title: "wash call"
draft: false
sidebar_position: 3
description: "wash call command reference"
--- 

`wash call` can be used to directly invoke a component. This can be useful when debugging, especially when the component isn't directly accessible via external channels such as HTTP. It is not recommended to use `wash call` in production environments.

### Usage

```bash
wash up --detached
wash start component wasmcloud.azurecr.io/echo:0.3.8 echo
wash call echo wasi:cli/run.run --bin s
```

### Options

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--rpc-host` (Alias `-r`) RPC Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_RPC_HOST=] [default: 127.0.0.1]

`--rpc-port` RPC Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_RPC_PORT=] [default: 4222]

`--rpc-jwt` JWT file for RPC authentication. Must be supplied with rpc_seed

`--rpc-seed` Seed file or literal for RPC authentication. Must be supplied with rpc_jwt

`--rpc-credsfile` Credsfile for RPC authentication. Combines rpc_seed and rpc_jwt. See https://docs.nats.io/using-nats/developer/connecting/creds for details [env: WASH_RPC_CREDS]

`--lattice`(Alias `-x`) Lattice for wasmcloud command interface, defaults to "default" [env: WASMCLOUD_LATTICE=]

`--data` (Alias `-d`) Optional JSON file to send as the operation payload

`--save` Optional file for saving binary response

`--bin` When using JSON output, display binary as binary ('b'), string ('s'), or both ('2'). Defaults to binary

`--test` When invoking a test component, interpret the response as TestResults
