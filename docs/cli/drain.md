---
title: "wash drain"
draft: false
sidebar_position: 10
description: "wash drain command reference"
--- 

`wash drain` helps you in managing contents of local wasmCloud caches. This command allows you to clear caches selectively for various items downloaded while working on a wasmCloud environment. 

:::warning
`wash drain` does not remove all data associated with wasmCloud on a given machine. NATS streams and buckets are decoupled from the rest of the system&mdash;see the [host troubleshooting](/docs/developer/debugging/host) page for instructions on how to achieve a complete wipe of a local wasmCloud environment.
:::

Following are the subcommands available under `wash drain`: 

- `all`
- `oci`
- `lib`
- `smithy`
- `downloads`

### `all`
Removes all cached files created by wasmCloud

#### Usage
```
wash drain all
```

### `oci`
Removes all cached files downloaded from OCI registries by wasmCloud

#### Usage
```
wash drain oci
```

### `lib`
Removes cached binaries extracted from provider archives

#### Usage
```
wash drain lib
```

### `smithy`
Removes cached smithy files downloaded from model urls

#### Usage
```
wash drain smithy
```

### `downloads`
Removes downloaded and generated files from launching wasmCloud hosts

#### Usage
```
wash drain downloads
```