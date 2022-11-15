---
title: "wasmCloud Shell (wash)"
date: 2018-12-29T11:02:05+06:00
draft: false
---

**_wash_** (the _wasmCloud Shell_) is a single command-line interface (CLI) to handle all of your wasmCloud tooling needs. This CLI has a number of sub-commands that help you interact with the wasmCloud ecosystem:

- `call` - Invoke methods in a wasmcloud actor
- `claims` - Functions related to reading, writing, and verifying claim attestations
- `ctl` - Interact with a live, running lattice [control interface](../lattice-protocols/control-interface).
- `ctx` - Functions for managing [contexts](./contexts) to easily connect to wasmCloud lattices
- `drain` - Functions for managing the contents of the local wasmcloud cache
- `keys` - Functions for generating, listing, and working with ed25519 encryption keys used for signatures
- `lint` - Perform lint checks on `.smithy` models.
- `new` - Functions for creating new projects from a template, such as actors, providers, and interfaces.
- `par` - Functions for working with [provider archives](../host-runtime/provider-archive), bundles of native libaries and claims for a capability provider.
- `reg` - Functions for interacting with OCI registries
- `validate` - Perform validatio checks on `.smithy` models.

`wash` has built-in help and you can follow any subcommand with `--help` to get more information about options available. For example `wash --help`, `wash ctl --help`, `wash ctl start --help`, and `wash ctl start actor --help` all provide context-relevant help..

## Installation

`wash` can be installed from a binary release, or with cargo. See [wash-cli](https://github.com/wasmcloud/wash/) for instructions on how to install it for your platform.
