---
title: "wash build"
draft: false
sidebar_position: 2
description: "wash build command reference"
---

To build custom wasmCloud entities like actors, providers or interfaces, `wash build` comes in as a handy tool. One can bring in their own project containing some business logic and build these entities by simply providing the path to the project or its associated `wasmcloud.toml` file. The built artifact is signed using keys or a user may use their own keys to sign the build.

### Usage

```
wash build -p path/to/wasmcloud.toml
```

### Options

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--config-path` (Alias `-p`) Path to the wasmcloud.toml file or parent folder to use for building

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL]

`--keys-directory` Location of key files for signing. Defaults to $WASH_KEYS (`$HOME/.wash/keys`) [env: WASH_KEYS]

`--issuer` (Alias `-i`) Path to issuer seed key (account). If this flag is not provided, the seed will be sourced from $WASH_KEYS (`$HOME/.wash/keys`) or generated for you if it cannot be found [env: WASH_ISSUER_KEY]

`--subject` (Alias `-s`) Path to subject seed key (module or service). If this flag is not provided, the seed will be sourced from $WASH_KEYS (`$HOME/.wash/keys`) or generated for you if it cannot be found [env: WASH_SUBJECT_KEY]

`--disable-keygen` Disables autogeneration of keys if seed(s) are not provided

`--build-only` Skip signing the artifact and only use the native toolchain to build