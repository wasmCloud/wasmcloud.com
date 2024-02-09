---
title: "wash build"
draft: false
sidebar_position: 2
description: "wash build command reference"
---

`wash build` enables users to build and sign custom wasmCloud entities like actors, providers, or interfaces. One can bring in their own project containing some business logic and build these entities by simply providing the path to the project or its associated `wasmcloud.toml` file. The built artifact is signed using automatically generated keys or a user may use their own keys to sign the build.

### Usage

```
wash build -p path/to/wasmcloud.toml
```

#### Custom build commands

In `wasmcloud.toml`, the `build_command` field can specify a custom build command to run "under the hood" of `wash build`. This enables extended language support through any component toolchain that compiles to WASI 0.2. The example below uses [`componentize-py`](https://github.com/bytecodealliance/componentize-py) to generate a Python-based component:

```toml
name = "PythonExample"
language = "rust"
type = "actor"
version = "0.1.0"

[actor]
claims = ["wasmcloud:httpclient", "wasmcloud:httpserver"]
build_command = "componentize-py -d ../../wit -w wasi:http/proxy@0.2.0-rc-2023-12-05 componentize app -o http.wasm"
build_artifact = "http.wasm"
```

When using the `build_command` field, users must also specify the `build_artifact`: the filename and location of the Wasm artifact that will be produced by the build command. This provides `wash build` with a target for signing the artifact.  

**Note**: Currently the `language` field in the `wasmcloud.toml` metadata must be set to an "officially supported" language (i.e. Rust or Go) to avoid errors. The `build_command` field does not have full support for environment variables or multiple commands and should be in the form of "command arg1 arg2 arg...". Use an external script to handle more complex build commands.  

### Options

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--config-path` (Alias `-p`) Path to the wasmcloud.toml file or parent folder to use for building

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL]

`--keys-directory` Location of key files for signing. Defaults to $WASH_KEYS (`$HOME/.wash/keys`) [env: WASH_KEYS]

`--issuer` (Alias `-i`) Path to issuer seed key (account). If this flag is not provided, the seed will be sourced from $WASH_KEYS (`$HOME/.wash/keys`) or generated for you if it cannot be found [env: WASH_ISSUER_KEY]

`--subject` (Alias `-s`) Path to subject seed key (module or service). If this flag is not provided, the seed will be sourced from $WASH_KEYS (`$HOME/.wash/keys`) or generated for you if it cannot be found [env: WASH_SUBJECT_KEY]

`--disable-keygen` Disables autogeneration of keys if seed(s) are not provided

`--build-only` Skip signing the artifact and only use the native toolchain to build