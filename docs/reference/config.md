---
title: 'wasmcloud.toml'
date: 2023-09-29T11:02:05+06:00
sidebar_position: 4
draft: false
---

`wasmcloud.toml` is the main configuration file for a wasmCloud project, analogous to a `package.json` or `Cargo.toml` file. 

Let's look at an example:

```toml
name = "http-hello-world"
language = "rust"
type = "component"
version = "0.1.0"

[component]
wit_world = "hello"
wasm_target = "wasm32-wasi-preview2"
```

This is a fairly minimal configuration for a `hello world` component written in Rust. It defines everything needed to build and sign the component, including the language toolchain to use.

## `wash build`

The partner-in-crime to `wasmcloud.toml` is `wash build`. This command takes all the options set in the `wasmcloud.toml` file to build and sign the component/provider/interface.

See the [`build` docs](https://github.com/wasmCloud/wasmCloud/tree/main/crates/wash-cli#build) for more info.

## `wasmcloud.toml` Spec

### Common Config

| Setting       | Type   | Default                           | Description                                                                                        |
| ------------- | ------ | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `name`          | string |                                   | Name of the project.                                                                               |
| language      | string |                                   | Language that component or provider is written in. Valid values are: `rust`, `tinygo`, `go`, or `other`. |
| type          | string |                                   | Type of wasmCloud artifact that is being generated. Valid values are: `component` or `provider`.         |
| version       | string |                                   | Semantic version of the project.                                                                   |
| path          | string | `{pwd}`                           | Path to the project root. Determines where build commands should be run.                           |
| build         | string | `./build`                         | Path to the directory where built artifacts should be written.                                     |
| wit           | string | `./wit`                           | Path to the directory where the WIT world and dependencies can be found.                           |

### Language Config - `[tinygo]`

| Setting             | Type    | Default        | Description                                                                                             |
| ------------------- | ------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| tinygo_path         | string  | `which tinygo` | The path to the TinyGo binary.                                                                          |
| disable_go_generate | boolean | false          | Whether to disable the 'go generate' step in the build process.                                         |
| scheduler           | string  | `asyncify`     | Override the default scheduler (asyncify). Valid values are: `none`, `tasks`, `asyncify`.               |
| garbage_collector   | string  | `conservative` | The garbage collector to use for the TinyGo build. Valid values are: `none`, `conservative`, `leaking`. |

### Language Config - `[rust]`

| Setting     | Type    | Default       | Description                             |
| ----------- | ------- | ------------- | --------------------------------------- |
| cargo_path  | string  | `which cargo` | The path to the cargo binary            |
| target_path | string  | `./target`    | Path to cargo/rust's `target` directory |
| debug       | boolean | false         | Whether to build in debug mode.         |

### Registry Config - `[registry.push]`

| Setting       | Type    | Default | Description                                                                                     |
| ------------- | ------- | ------- | ----------------------------------------------------------------------------------------------- |
| url           | string  | N/A     | URL of the registry to use when pushing OCI artifacts (i.e. `wash push`).                       |
| credentials   | string  |         | Path to a credentials file to use when pushing to registries (ex. specified by `url`).          |
| push_insecure | boolean |         | Whether or not to push to the registry insecurely with HTTP.                                    |

### Type Config - `[component]`

| Setting             | Type    | Default                                   | Description                                                                                                                                                                                                                                                                                                                   |
| ------------------- | ------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| build_artifact      | string  | `./build/[name].wasm`                     | Optional override path where `wash` can expect to find the built and unsigned WebAssembly artifact.                                                                                                                                                                                                                           |
| build_command       | string  | Language-specific command                 | Optional command to run instead of inferring the default language toolchain build command. Supports commands in the format of `command ...arg`. `wash` expects that the build command will result in an artifact under the project `build` folder named either `{wasm_bin_name}.wasm` if supplied or `{name}.wasm` otherwise. |
| call_alias          | string  |                                           | The call alias of the component                                                                                                                                                                                                                                                                                               |
| destination         | string  | `./build/[name]_s.wasm`                   | File path to output the destination WebAssembly artifact after building and signing.                                                                                                                                                                                                                                          |
| key_directory       | string  | `~/.wash/keys`                            | The directory to store the private signing keys in.                                                                                                                                                                                                                                                                           |
| tags                | string  |                                           | Tags that should be applied during the component signing process.                                                                                                                                                                                                                                                             |
| wasip1_adapter_path | string  |                                           | Path to a wasm adapter that can be used for WASI P2.                                                                                                                                                                                                                                                                          |
| wasm_target         | string  | `wasm32-unknown-unknown`                  | Compile target. Valid values are: `wasm32-unknown-unknown`, `wasm32-wasi-preview1`, `wasm32-wasi-preview2`.                                                                                                                                                                                                                      |
| wit_world           | string  |                                           | The WIT world that is implemented by the component.                                                                                                                                                                                                                                                                           |


### Type Config - `[provider]`

| Setting       | Type   | Default                                       | Description                                                                                                                      |
| ------------- | ------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| vendor        | string | `NoVendor`                                    | The vendor name of the provider.                                                                                                 |
| wit_world     | string |                                               | The WIT world that is implemented by the component.                                                                              |
| os            | string | Current OS                                    | The target operating system of the provider archive.                                                                             |
| arch          | string | Current architecture                          | The target architecture of the provider archive.                                                                                 |
| rust_target   | string | Default Rust toolchain                        | For Rust-based providers, the Rust target triple to build for.                                                                   |
| bin_name      | string | Inferred from `cargo.toml` for Rust providers | The provider binary name. Required for Go-based providers, or if the name otherwise cannot be inferred from a `Cargo.toml` file. |
| key_directory | string | `~/.wash/keys`                                | The directory to store the private signing keys in.                                                                              |


### WIT dependency fetch/pull configuration - `[registry].pull`
:::info
The `[registry].pull` section requires `wash v0.38.0+`.
:::

When fetching or pulling [WIT][wit] interfaces (e.g. [`wasi:keyvalue`][wasi-keyvalue], [`wasi:http`][wasi-http]), it can be useful to provide and/or override default sources.
This effect can be achieved with the `pull` member of the `[registry]` configuration section in `wasmcloud.toml`.

Configuration for `[registry].pull` can be specified as a TOML table, as in the following example `wasmcloud.toml`:

```toml
name = "example-component"
language = "rust"
type = "component"

[component]
wasm_target = "wasm32-wasip2"

[registry.pull]
sources = [
    { target = "wasmcloud:bus", source = "oci://ghcr.io/wasmcloud/targets" },
    { target = "test-components:testing", source = "file://extra-wit/pingpong.wit" },
    { target = "wasi:config", source = "https://github.com/WebAssembly/wasi-config/archive/v0.2.0-draft.tar.gz" },
    { target = "wasi:blobstore", source = "git+https://github.com/WebAssembly/wasi-blobstore.git" },
    { target = "wasi:messaging", source = "git+ssh://github.com/WebAssembly/wasi-messaging.git" },
]
```

Configuration for `registry.pull` can also be specified as a TOML array of tables, as in the following *equivalent* `wasmcloud.toml`:

```toml
name = "example-component"
language = "rust"
type = "component"

[component]
wasm_target = "wasm32-wasip2"

[[registry.pull.sources]]
target = "wasmcloud:bus"
source = "oci://ghcr.io/wasmcloud/targets"

[[registry.pull.sources]]
target = "test-components:testing"
source = "file://extra-wit/pingpong.wit"

[[registry.pull.sources]]
target = "wasi:config"
source = "https://github.com/WebAssembly/wasi-config/archive/v0.2.0-draft.tar.gz"

[[registry.pull.sources]]
target = "wasi:blobstore"
source = "git+https://github.com/WebAssembly/wasi-blobstore.git"

[[registry.pull.sources]]
target = "wasi:messaging"
source = "git+ssh://github.com/WebAssembly/wasi-messaging.git"
```

The two above configurations have an identical effect.

The `target` used for an override can be at multiple levels:

- Namespace (ex. `wasi`)
- Package (ex. `wasi:config`)

For advanced use cases, overrides can also be specified with versions like so:

```toml
[[registry.pull.sources]]
target = "wasi:messaging@0.2.1-draft"
source = "git+ssh://github.com/WebAssembly/wasi-messaging.git"
```

[wit]: https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md
[wasi-keyvalue]: https://github.com/WebAssembly/wasi-keyvalue
[wasi-http]: https://github.com/WebAssembly/wasi-http

### Overrides config (local files only) - `[overrides]`

:::warning[deprecated]
The `[overrides]` section differs from `[registry].pull` in that it only intended for *local file based overrides*. The `[registry].pull` supports overriding OCI registries,
files, and other sources for WIT packages.

While projects that use `[overrides]` will continue to work, consider migrating to use `[registry].pull`.
:::

Overrides are key-value pairs that can be used to override locations of wit dependencies. The key name should match the package reference without a version (e.g. `wasi:http`).

For example, if you have a dependency called `my:local-dep@0.1.0` that is located in another directory, you can tell `wash` how to find it with the following overrides section:

```toml
[overrides]
"my:local-dep" = { path = "../path/to/my/local/dep" }
```

It can also be used to override a version requirement for a package, but this is a highly advanced use case and should be used with caution.

```toml
[overrides]
"my:local-dep" = { version = "^0.1.0" }
```

### Dev Overrides Config (Imports and Exports) - `[[dev.overrides.imports]]` or `[[dev.overrides.exports]]`

Dev overrides enable users to override the `wash dev` process defaults when satisfying a capability requirement. For example, `wash dev` automatically satisfies a key-value store requirement with the NATS-KV provider, but a dev override could enable a user to use the Redis key-value provider in a dev loop.

Dev overrides can be useful for specifying third-party providers as well as providers for custom interfaces that are not well-known to the `wash dev` process.

| Setting        | Type   | Description                                                                                                                                                  |
|----------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface_spec | string | Interface specification (e.g., `"wasi:keyvalue@0.2.0-draft"`)                                                                                                |
| image_ref      | string | OCI image reference (e.g., `"ghcr.io/wasmcloud/keyvalue-redis:0.28.2"`)                                                                                      |
| config         | object | Configuration (e.g., `{ values = { url = "redis://127.0.0.1:6379" } }`)                                                                                      |
| secrets        | object | Secrets that should be provided to the entity                                                                                                                |
| link_name      | string | Link name that should be used to reference the component. This is only required when there are *multiple* conflicting overrides (i.e. there is no "default") |
