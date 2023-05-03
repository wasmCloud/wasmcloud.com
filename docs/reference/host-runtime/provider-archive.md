---
title: "Provider Archives"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 7
draft: false
---

A **_provider archive_** is, as its name implies, an archive file that contains a capability provider. Because we do not currently have sufficient networking support in the [WASI](https://wasi.dev/) specification and corresponding engine implementations, we don't yet have the ability to create capability providers out of the same portable WebAssembly files that we use to create actors.

As a result, instead of embedding a JSON Web Token (JWT) inside a `.wasm` file, we place one inside the provider archive file. The underlying archive format of the file is not relevant to the documentation here. As long as you're interacting with provider archives using the [provider-archive](https://crates.io/crates/provider-archive) crate, then that API is guaranteed to work going forward regardless of the underlying compression implementation.

Each provider archive contains the JSON Web Token and it also contains a binary file for each supported operating system and CPU architecture combination. This allows the same archive to be used to load a capability provider on multiple target environments, from edge to the cloud. Again, this kind of architecture is merely a stopgap until we have more mature WASI support in the community, at which point we can deprecate provider archives in favor of what we call the _portable capability provider_ (WASI-enabled, privileged `.wasm` file).

For example, a typical archive might contain the following files:

- `token.jwt` - The embedded token. The exact filename is not important for this documentation.
- `x86_64-linux` - The executable file for x86/64 linux
- `x86_64-macos` - The executable file for macOS
- `aarch64-linux` - Executable file for the general purpose 64-bit ARM using Linux
- `armv7-linux` - Executable file for armv7 (e.g. RasPi) linux

Both provider archives and actors can be stored in suitable OCI registries, and as such wasmCloud supports the declarative startup/shutdown of actors and capability providers using their respective OCI reference URIs. For example, you can start the example `kvcounter` actor in any wasmCloud host connected to the internet by starting `https://wasmcloud.azurecr.io/kvcounter:0.4.2`. We keep a list updated in our [capability providers](https://github.com/wasmCloud/capability-providers#first-party-capability-providers) README.
