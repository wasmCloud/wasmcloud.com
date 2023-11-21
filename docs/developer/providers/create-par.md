---
title: "Creating a provider archive"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 8
draft: false
---

A [provider archive](/docs/reference/glossary#provider-archive) (also called a _par file_) is an archive file (in unix 'tar' format) containing platform-specific executable files for a variety of CPU and OS combinations. A typical provider archive file contains executables for 64-bit linux, x86_64 macos, aarch64 macos, and other supported platforms. The par file includes a cryptographically signed JSON Web Token (JWT) that contains a set of claims attestations for the capability provider.

A provider archive can be uploaded to, or downloaded from, OCI registries.

Capability providers are always compiled in "release" mode. The `Makefile` created for your new project already has rules to compile the source code and issue the applicable `wash` commands to assemble the par file with a signed JWT. All you need to do is type `make`, and the par file is generated in `build/your-project.par.gz`.

If this is the first time you've run this command, some keys will be generated for you and you should see output that looks like the following:

```sh
No keypair found in "/home/user/.wash/keys/fakepay_provider_service.nk".
We will generate one for you and place it there.
If you'd like to use alternative keys, you can supply them as a flag.

Successfully created archive build/fakepay_provider.par.gz
```

:::caution

The `wash` command creates a private issuer _seed key_ if there isn't one already. Additionally, it generates a _seed key_ for the provider archive itself, and stores it in a file called `fakepay_provider_service.nk`. The `wash` CLI will continue to re-use these keys for signing future versions of this provider archive - Keep all keys secret - they are used by the lattice to know that updates were created by the same author as the original When you move your provider to production you will want to pass explicit paths to the signing keys so that you can control the `issuer` and `subject` fields of the embedded token.
:::

We can use `wash` to inspect a provider archive as well (primary key has been truncated to fit documentation):

```sh
wash par inspect build/fakepay_provider.par.gz
╔══════════════════════════════════════════════════════════════════════╗
║                        Fake Payments - Provider Archive              ║
╠═══════════════════════╦══════════════════════════════════════════════╣
║ Account               ║ ############################################ ║
╠═══════════════════════╬══════════════════════════════════════════════╣
║ Service               ║ ############################################ ║
╠═══════════════════════╬══════════════════════════════════════════════╣
║ Capability Contract ID║                  wasmcloud:examples:payments ║
╠═══════════════════════╬══════════════════════════════════════════════╣
║ Vendor                ║                                         Acme ║
╠═══════════════════════╬══════════════════════════════════════════════╣
║ Version               ║                                        0.1.0 ║
╠═══════════════════════╬══════════════════════════════════════════════╣
║ Revision              ║                                            0 ║
╠═══════════════════════╩══════════════════════════════════════════════╣
║                   Supported Architecture Targets                     ║
╠══════════════════════════════════════════════════════════════════════╣
║ x86_64-linux                                                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

At this point we've decided on a logical contract for actors and capability providers to use for the Payments service. We created a (mostly) code-generated interface crate that can be declared as a dependency by both provider and actor, and we created a dummy implementation of the payments provider.

Next we'll write an actor that communicates with any payment provider, regardless of whether it's our fake implementation or not.
