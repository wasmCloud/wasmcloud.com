---
title: "wash call"
draft: false
sidebar_position: 3
description: "wash call command reference"
--- 

`wash call` can be used to directly invoke an component. This can be useful when debugging, especially when the component isn't directly accessible via external channels such as HTTP. It is not recommended to use `wash call` in production environments.

### Usage
```
export CLUSTER_SEED=$(wash keys gen cluster -o json | jq -r .seed)
wash up --detached --cluster-seed $CLUSTER_SEED
wash start component wasmcloud.azurecr.io/echo:0.3.8
wash call --cluster-seed $CLUSTER_SEED MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5 HttpServer.HandleRequest '{"method": "GET", "path": "/", "body": "", "queryString":"","header":{}}' -o json --bin s
```

### Options

`--cluster-seed` (Alias `-c`) wasmCloud host cluster seed. This cluster seed must match the cluster seed used to launch the wasmCloud host

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--rpc-host` (Alias `-r`) RPC Host for connection, defaults to 127.0.0.1 for local NATS

`--rpc-port` RPC Port for connections, defaults to 4222 for local NATS

`--rpc-jwt` JWT file for RPC authentication. Must be supplied with rpc_seed

`--rpc-seed` Seed file or literal for RPC authentication. Must be supplied with rpc_jwt

`--rpc-credsfile` Credsfile for RPC authentication. Combines rpc_seed and rpc_jwt. See https://docs.nats.io/using-nats/developer/connecting/creds for details

`--lattice-prefix`(Alias `-x`) Lattice name for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--data` (Alias `-d`) Optional JSON file to send as the operation payload

`--save` Optional file for saving binary response

`--bin` When using JSON output, display binary as binary ('b'), string ('s'), or both ('2'). Defaults to binary

`--test` When invoking a test component, interpret the response as TestResults
