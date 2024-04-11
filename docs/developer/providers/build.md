---
title: 'Build'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 2
draft: false
---

A [provider archive](/docs/1.0/reference/glossary#provider-archive) (also called a _par file_) is an archive file (in unix 'tar' format) containing platform-specific executable files for a variety of CPU and OS combinations. A typical provider archive file contains executables for 64-bit Linux, x86_64 macOs, aarch64 macOs, and other supported platforms. The par file includes a cryptographically signed JSON Web Token (JWT) that contains a set of claims attestations for the capability provider.

A provider archive can be uploaded to, or downloaded from, OCI registries.

## Build

Providers are always compiled in "release" mode. `wash` has support to compile a capability provider for your native target with `wash build`, as long as a [wasmcloud.toml](/docs/1.0/reference/config) file is present. The following section will continue on from the [Create](./create.md) page where we built a NATS messaging provider, but you can follow the same steps for any capability provider project.

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
