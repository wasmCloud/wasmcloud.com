---
title: "wash down"
draft: false
sidebar_position: 9
description: "wash down command reference"
--- 

This command will stop all the resources started by `wash up`. Primarily it will stop the wasmCloud host and NATS leaf that were started on your local machine. If there is a single host running on your machine, `wash down` will stop that singular host. In case of multiple hosts, the user gets a choice to stop a specific host or all the running hosts on the system. To stop a specific host in a multiple host scenario, pass the `--host-id` flag to the command. To stop currently running hosts, pass the `--all` flag.

### Usage
```
# For a singular host
wash down 

# For a specific host
wash down --host-id=hostid

# For all hosts
wash down --all
```

### Options
`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--lattice-prefix` (Alias `-x`) A lattice prefix is a unique identifier for a lattice, and is frequently used within NATS topics to isolate messages from different lattices [env: WASMCLOUD_LATTICE_PREFIX=] [default: default]

`--ctl-host` An IP address or DNS name to use to connect to NATS for Control Interface (CTL) messages, defaults to the value supplied to --nats-host if not supplied [env: WASMCLOUD_CTL_HOST=]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--ctl-port` A port to use to connect to NATS for CTL messages, defaults to the value supplied to --nats-port if not supplied [env: WASMCLOUD_CTL_PORT=]

`--ctl-credsfile` Convenience flag for CTL authentication, internally this parses the JWT and seed from the credsfile [env: WASMCLOUD_CTL_CREDSFILE=]

`--ctl-seed` A seed nkey to use to authenticate to NATS for CTL messages [env: WASMCLOUD_CTL_SEED=]

`--ctl-jwt` A user JWT to use to authenticate to NATS for CTL messages [env: WASMCLOUD_CTL_JWT=

`--host-id` The ID of the host to terminate

`--all` Flag to stop all hosts