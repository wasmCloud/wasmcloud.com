---
title: "wash app"
draft: false
sidebar_position: 8
description: "wash app command reference"
---

`wash app` is used to manage declarative applications and deployments on wasmCloud. 

- list
- get
- history
- del
- put
- deploy
- undeploy

### list
The `wash app list` command is used to list all the application specifications within the lattice.
The following options can be specified.
#### --output 
    Alias: `-o`
        Specify output format (text or json) [default: text]
        
#### --ctl-host 
    Alias: `-r`
        CTL Host for connection, defaults to 127.0.0.1 for local nats [env: WASMCLOUD_CTL_HOST=]

#### --experimental
        Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

#### --ctl-port 
    Alias: `-p`
        CTL Port for connections, defaults to 4222 for local nats [env: WASMCLOUD_CTL_PORT=]

#### --ctl-jwt 
        JWT file for CTL authentication. Must be supplied with ctl_seed [env: WASMCLOUD_CTL_JWT]

#### --ctl-seed 
        Seed file or literal for CTL authentication. Must be supplied with ctl_jwt [env: WASMCLOUD_CTL_SEED]

#### --ctl-credsfile 
        Credsfile for CTL authentication. Combines ctl_seed and ctl_jwt. See https://docs.nats.io/developing-with-nats/security/creds for details [env: WASH_CTL_CREDS]

#### --js-domain 
        JS domain for wasmcloud control interface. Defaults to None [env: WASMCLOUD_JS_DOMAIN]

#### --lattice-prefix 
    Alias: `-x`
        Lattice prefix for wasmcloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

#### --timeout-ms 
    Alias: `-t`
        Timeout length to await a control interface response, defaults to 2000 milliseconds [env: WASMCLOUD_CTL_TIMEOUT_MS=] [default: 2000]

#### --context 
        Path to a context with values to use for CTL connection and authentication

Usage:

### get
The `wash app get` command is used to retrieve the details for a specific version of an app specification.

### history
The `wash app history` command is used to retrieve the version history of a given model within the lattice.

### del
The `wash app del` command is used to delete an application model of a specific version.

### put
The `wash app put` command put a application model into the store. (What store?)

### deploy
`wash app deploy`is used to deploy an application and start the deployment monitor.

### undeploy
`wash app undeploy` is used to undeploy an application and stop the deployment monitor.