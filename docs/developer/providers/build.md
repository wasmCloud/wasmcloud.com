---
title: 'Build'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 2
draft: false
---

A [provider archive](/docs/reference/glossary#provider-archive) (also called a _par file_) is an archive file (in unix 'tar' format) containing platform-specific executable files for a variety of CPU and OS combinations. A typical provider archive file contains executables for 64-bit Linux, x86_64 macOs, aarch64 macOs, and other supported platforms. The par file includes a cryptographically signed JSON Web Token (JWT) that contains a set of claims attestations for the capability provider.

A provider archive can be uploaded to, or downloaded from, OCI registries.

## Build

Providers are always compiled in "release" mode. `wash` has support to compile a capability provider for your native target with `wash build`, as long as a [wasmcloud.toml](/docs/reference/config) file is present. The following section will continue on from the [Create](./create.md) page where we built a NATS messaging provider, but you can follow the same steps for any capability provider project.

```bash
> wash build

Built artifact can be found at "/Users/wasmcloud/messaging-nats/build/wasmcloud-example-messaging-nats.par.gz"
```

:::warning
The `wash` command creates a private issuer _seed key_ if there isn't one already. Additionally, it generates a _seed key_ for the provider archive itself, and stores it in a file called `wasmcloud-example-messaging-nats_service.nk`. The `wash` CLI will continue to re-use these keys for signing future versions of this provider archive&mdash;keep all keys secret&mdash;they are used by the lattice to know that updates were created by the same author as the original When you move your provider to production you will want to pass explicit paths to the signing keys so that you can control the `issuer` and `subject` fields of the embedded token.
:::

## Inspect

We can use `wash` to inspect a provider archive as well (primary key has been truncated to fit documentation):

```bash
> wash par inspect ./build/wasmcloud-example-messaging-nats.par.gz

                    Messaging NATS - Capability Provider
Account             ACVPZZJPNCTXHR3IAVKVD4FSJTNIX43O4EXPKXNWUYGG2T4KZG2XDQDI
Service             VDVLZBMLFOAWLXFW3K47K3JEO5NWH35ZARWICRMHUEEQAWHGSMDJPP4X
Vendor                                                        Example Vendor
Version                                                                0.1.0
Revision                                                                   0
                        Supported Architecture Targets
aarch64-macos
```

## Support Multiple Architectures

`wash build` has support for creating a provider archive with the locally installed toolchain. If you need to support multiple architectures, you can use `wash par` to insert additional binaries into your archive.

The following example walks through creating an initial provider archive, using `cargo` with an appropriate toolchain to cross-compile for the `x86_64-unknown-linux-gnu` architecture, and then inserting the additional binary into the archive.

:::warning
Due to the complexity of compiling for different architectures and operating systems, `wash` does not have support for building targets other than the native target.
:::

```bash
# Create the initial provider archive
wash build
# Build for an additional target (assuming you have the correct toolchain installed)
cargo build --target x86_64-unknown-linux-gnu
# Insert the additional binary into the archive
wash par insert /path/to/archive.par.gz --binary ./target/x86_64-unknown-linux-gnu/debug/provider-binary --arch x86_64-linux
```

This process can be repeated as necessary to add additional targets. You can use `wash inspect` in order to verify that your additional architectures are properly inserted in the archive.

```bash
> wash inspect ghcr.io/wasmcloud/messaging-nats:canary

                messaging-nats-provider - Capability Provider
Account                 ACOJJN6WUP4ODD75XEBKKTCCUJJCY5ZKQ56XVKYK4BEJWGVAOOQHZMCW
Service                 VADNMSIML2XGO2X4TPIONTIC55R2UUQGPPDZPAVSC2QD7E76CR77SPW7
Vendor                                                                 wasmcloud
Version                                                                   0.19.0
Revision                                                                    None
                        Supported Architecture Targets
aarch64-macos
x86_64-linux
aarch64-linux
x86_64-windows
x86_64-macos
```

With the build complete, now we can [continue to testing](./test).

## Interface dependencies and `wash build`

:::warning
Some provider implementations may have issues with the new dependency fetching&mdash;see [the section below on migration](#migrating-from-wit-deps) for additional details
:::

You may have noticed that one of the commands that `wash build` runs for you is the equivalent of `wkg wit fetch`. `wkg` is a CLI tool provided by the ByteCode Alliance as part of the [Wasm package tooling](https://github.com/bytecodealliance/wasm-pkg-tools) project. It is meant to be a standard set of configuration and tooling that can be used across all languages. `wash` is directly integrated into this tooling with some additional helpers to make it automatically aware of `wasmcloud` namespaced interfaces. If you use `wkg`, you will be using the same configuration and lock files that `wash` uses. The tooling works by reading the specified world in your wit files and downloading the appropriate dependencies automatically into the `wit/deps` directory. As such, in most cases you should add `wit/deps` to your `.gitignore` file and commit the generated `wkg.lock` file.

Without any additional configuration, `wash` can download dependencies from the following namespaces (i.e. the `wasi` in `wasi:http@0.2.1`):

- `wasi`
- `wasmcloud`
- `wrpc`
- `ba`

So in most basic cases, all of this dependency fetching and management should be fairly transparent! However, as your usage of Wasm grows, you are likely to use dependencies that are not in the above namespaces (such as internal registries or other remappings). Also, if you plan to publish any custom interfaces, you will need to configure your registry with credentials.

:::warning
Please note the configuration format is subject to change, including some additional override configurations options within the `wasmcloud.toml` file. Things should be backwards compatible, but be aware that things may change (and will likely be simpler)!
:::

The default configuration file for `wash` is located inside of the standard configuration directory at `~/.wash/package_config.toml`. 

Below is an extremely simple configuration showing the basics of a file that can be used to configure `wkg` to download and publish dependencies to/from a private registry. For more complete information on the configuration options, see the [Wasm package tooling documentation](https://github.com/bytecodealliance/wasm-pkg-tools#configuration).

```toml
[namespace_registries]
# The namespace maps to a configuration that tells the client where to download dependencies from.
# If you are running a heavily used and/or large registry, see https://github.com/bytecodealliance/wasm-pkg-tools#well-known-metadata
# for more information on how to configure a well-known metadata file, which simplifies this configuration section.
custom = { registry = "custom", metadata = { preferredProtocol = "oci", "oci" = { registry = "ghcr.io", namespacePrefix = "myorg/interfaces/" } } }

# The registry section is used to configure the client to authenticate to the registry. The name
# "custom" must match the `registry` key in the namespace_registries section.
[registry."custom".oci]
auth = { username = "open", password = "sesame" }
```

With the above configuration, if a package named `custom:regex@0.1.0` is found, it will attempt to download it from `ghcr.io/myorg/interfaces/custom/regex:0.1.0`, using the credentials provided in the `auth` section (if needed). If the registry is public, you can omit the `registry` section at the bottom entirely.

### Migrating from `wit-deps`

Older versions of `wash` required a separate step using a `wit-deps` tool to download dependencies. This is no longer necessary with the newest versions of `wash`. To preserve backwards compatibility, if a `deps.toml` file is found in the `wit` directory of the project, `wash` will not fetch dependencies for you. To migrate to the new deps management, simply remove the `deps.toml` file and run `wash build` again. `wash build` will automatically remove all the old dependencies and download the new ones into your `wit/deps` directory.

:::warning
If you are using some of the provided wrpc interfaces like `wrpc:blobstore`, you will need to continue using `wit-deps`. This is due to an issue where some of the wrpc interfaces use syntax that is not yet available in the main WIT parser (but will be when WASI 0.3 is released) which causes the dependency resolution to fail.
:::
