---
title: 'Sandboxing components'
date: 2024-03-12T11:02:05+06:00
sidebar_position: 7
draft: false
description: 'Using WASI Virt to sandbox components'
---
In conventional usage, components using WASI APIs such as **Sockets** and **Filesystem** have access to core operating system interfaces. In order to run such APIs securely on wasmCloud, it is necessary to isolate the component with [**WASI Virt**](https://github.com/bytecodealliance/wasi-virt).

WASI Virt is a [Bytecode Alliance](https://bytecodealliance.org/) project that enables encapsulation of a virtualized component within another component. WASI API usage is deny-by-default for virtualized components&mdash;interfaces must be explicitly enabled at the time of composition. WASI Virt supports the following WASI APIs:

* Clocks
* Environment
* Exit
* Filesystem
* HTTP
* Random
* Sockets
* Stdio

WASI Virt's virtual adapters are implemented with Wasm, providing complete isolation between the application and virtualization layers. Because WASI Virt and wasmCloud use the common standards of the Component Model and WASI P2, components generated with WASI Virt need only to be signed with `wash`, and then may be deployed to wasmCloud.

## Install WASI Virt

WASI Virt requires the nightly release channel for [Rust](https://www.rust-lang.org/tools/install):

```bash
rustup toolchain install nightly
```

Install the `wasi-virt` command line tool with Rust's `cargo` package manager:

```bash
cargo +nightly install --git https://github.com/bytecodealliance/wasi-virt
```

## Sandbox a component

Once installed, run `wasi-virt` on a component to virtualize it within a new encapsulating component. By default, the output component is `virt.wasm`.

```bash
wasi-virt hello.wasm -o virt.wasm
```

## Arguments

The following arguments to `wasi-virt` are available for managing interfaces. Arguments are added after defining the component to be virtualized, like so:

```bash
wasi-virt component.wasm --allow-clocks -o virt.wasm
```

### Clocks

* **`--allow-clocks`**: Allow the `wasi-clocks` interface 

### Environment variables 

* **`-e CUSTOM=VAR`**: Set a defined environment variable while disallowing host environment variable access
* **`-e CUSTOM=VAR --allow-env`**: Set a defined environment variable while allowing all host environment variable access
* **`-e CUSTOM=VAR --allow-env=SOME,ENV_VARS`**: Set a defined environment variable while allowing some specific environment variable access

### Exit

* **`--allow-exit`**: Allow a component to terminate execution without panic and unwind

### Filesystem

* **`--mount /=./local-dir`**: Mount a virtual directory (globbing all files in local-dir and virtualizing them)
* **`--preopen /=/restricted/path`**: Provide host preopen mapping
* **`--mount /virt-dir=./local --preopen /host-dir=/host/path`**: Provide both host and virtual preopens

### HTTP

* **`--allow-http`**: Allow the `wasi-http` interface

### Random

* **`--allow-random`**: Allow the `wasi-random` interface

### Sockets

* **`--allow-sockets`**: Allow the `wasi-sockets` interface

### Stdio

* **`--stdio=ignore`**: Ignore all stdio
* **`--stdio=deny`**: Throw an error if any stdio is attempted (default)
* **`--stderr=allow`**: Allow stderr only
* **`--stdout=allow`**: Allow stdout only
* **`--stdin=allow`**: Allow stdin only

## Further reading

For more information on WASI Virt, see the [project repository on GitHub](https://github.com/bytecodealliance/wasi-virt).