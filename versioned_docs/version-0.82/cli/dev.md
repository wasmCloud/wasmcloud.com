---
title: "wash dev"
draft: false
sidebar_position: 8
description: "wash dev command reference"
--- 

Starts a local dev loop for an actor. Takes a local `wasmcloud.toml` file to deploy the sepcified actor and accepts a host ID to specify the host to deploy on. This is an experimental feature and needs `--experimental` flag to run.

### Usage
```
wash dev --experimental --host-id=<your-host-id>
```

### Options
`--nats-credsfile`Optional path to a NATS credentials file to authenticate and extend existing NATS infrastructure [env: NATS_CREDSFILE=]

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--nats-remote-url` Optional remote URL of existing NATS infrastructure to extend [env: NATS_REMOTE_URL=]

`--nats-connect-only` If a connection can't be established, exit and don't start a NATS server. Will be ignored if a remote_url and credsfile are specified [env: NATS_CONNECT_ONLY=]

`--nats-version` NATS server version to download, e.g. `v2.7.2`. See https://github.com/nats-io/nats-server/releases/ for releases [env: NATS_VERSION=] [default: v2.9.14]

`--nats-host` NATS server host to connect to [env: NATS_HOST=] [default: 127.0.0.1]

`--nats-port` NATS server port to connect to. This will be used as the NATS listen port if `--nats-connect-only` isn't set [env: NATS_PORT=] [default: 4222]

`--nats-websocket-port` NATS websocket port to use. Websocket support will not be enabled if this option isn't set. TLS is not supported. This is required for the wash ui to connect from localhost [env: NATS_WEBSOCKET_PORT=]

`--nats-js-domain` NATS Server Jetstream domain, defaults to `core` [env: NATS_JS_DOMAIN=]

`--wasmcloud-version` wasmCloud host version to download, e.g. `v0.80.0`. See https://github.com/wasmCloud/wasmCloud/releases for releases [env: WASMCLOUD_VERSION=] [default: v0.80.0]

`--lattice-prefix` (Alias `-x`) ALattice name for wasmCloud control interface, defaults to "default" [env: WASMCLOUD_LATTICE_PREFIX=]

`--host-seed` The seed key (a printable 256-bit Ed25519 private key) used by this host to generate it's public key [env: WASMCLOUD_HOST_SEED=]

`--rpc-host` An IP address or DNS name to use to connect to NATS for RPC messages, defaults to the value supplied to --nats-host if not supplied [env: WASMCLOUD_RPC_HOST=]

`--rpc-port` A port to use to connect to NATS for RPC messages, defaults to the value supplied to --nats-port if not supplied [env: WASMCLOUD_RPC_PORT=]

`--rpc-seed` A seed nkey to use to authenticate to NATS for RPC messages [env: WASMCLOUD_RPC_SEED=]

`--rpc-timeout-ms` Timeout in milliseconds for all RPC calls [env: WASMCLOUD_RPC_TIMEOUT_MS=] [default: 2000]

`--rpc-jwt` A user JWT to use to authenticate to NATS for RPC messages [env: WASMCLOUD_RPC_JWT=]

`--rpc-tls` Optional flag to enable host communication with a NATS server over TLS for RPC messages [env: WASMCLOUD_RPC_TLS=]

`--rpc-credsfile` Convenience flag for RPC authentication, internally this parses the JWT and seed from the credsfile [env: WASMCLOUD_RPC_CREDSFILE=]

`--ctl-host` An IP address or DNS name to use to connect to NATS for Control Interface (CTL) messages, defaults to the value supplied to --nats-host if not supplied [env: WASMCLOUD_CTL_HOST=]

`--ctl-port` A port to use to connect to NATS for CTL messages, defaults to the value supplied to --nats-port if not supplied [env: WASMCLOUD_CTL_PORT=]

`--ctl-seed` A seed nkey to use to authenticate to NATS for CTL messages [env: WASMCLOUD_CTL_SEED=]

`--ctl-jwt` A user JWT to use to authenticate to NATS for CTL messages [env: WASMCLOUD_CTL_JWT=]

`--ctl-credsfile` Convenience flag for CTL authentication, internally this parses the JWT and seed from the credsfile [env: WASMCLOUD_CTL_CREDSFILE=]

`--ctl-tls` Optional flag to enable host communication with a NATS server over TLS for CTL messages [env: WASMCLOUD_CTL_TLS=]

`--cluster-seed` The seed key (a printable 256-bit Ed25519 private key) used by this host to sign all invocations [env: WASMCLOUD_CLUSTER_SEED=]

`--cluster-issuers` A comma-delimited list of public keys that can be used as issuers on signed invocations [env: WASMCLOUD_CLUSTER_ISSUERS=]

`--provider-delay` Delay, in milliseconds, between requesting a provider shut down and forcibly terminating its process [env: WASMCLOUD_PROV_SHUTDOWN_DELAY_MS=] [default: 300]

`--allow-latest` Determines whether OCI images tagged latest are allowed to be pulled from OCI registries and started [env: WASMCLOUD_OCI_ALLOW_LATEST=]

`--allowed-insecure` A comma-separated list of OCI hosts to which insecure (non-TLS) connections are allowed [env: WASMCLOUD_OCI_ALLOWED_INSECURE=]

`--wasmcloud-js-domain` Jetstream domain name, configures a host to properly connect to a NATS supercluster, defaults to `core` [env: WASMCLOUD_JS_DOMAIN=]

`--config-service-enabled` Denotes if a wasmCloud host should issue requests to a config service on startup [env: WASMCLOUD_CONFIG_SERVICE=]

`--allow-file-load` Denotes if a wasmCloud host should allow starting actors from the file system [env: WASMCLOUD_ALLOW_FILE_LOAD=] [default: true] [possible values: true, false]

`--enable-structured-logging` Enable JSON structured logging from the wasmCloud host [env: WASMCLOUD_STRUCTURED_LOGGING_ENABLED=]

`--log-level` Controls the verbosity of JSON structured logs from the wasmCloud host [env: WASMCLOUD_LOG_LEVEL=] [default: info]

`--enable-ipv6` Enables IPV6 addressing for wasmCloud hosts [env: WASMCLOUD_ENABLE_IPV6=]

`--wasmcloud-start-only` If enabled, wasmCloud will not be downloaded if it's not installed

`--wadm-version` wadm version to download, e.g. `v0.4.0`. See https://github.com/wasmCloud/wadm/releases for releases [env: WADM_VERSION=] [default: v0.7.1]

`--disable-wadm` Disables wadm

`--host-id` ID of the host to use for `wash dev` if one is not selected, `wash dev` will attempt to use the single host in the lattice

`--work-dir` Path to code directory [env: WASH_DEV_CODE_DIR=]

`--leave-host-running` Leave the wasmCloud host running after stopping the devloop [env: WASH_DEV_LEAVE_HOST_RUNNING=]

`--use-host-subprocess` Run the wasmCloud host in a subprocess (rather than detached mode) [env: WASH_DEV_USE_HOST_SUBPROCESS=]
