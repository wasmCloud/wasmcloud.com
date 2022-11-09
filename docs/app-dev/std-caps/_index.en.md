---
title: "Using standard capabilities"
date: 2018-12-29T11:02:05+06:00
weight: 3
draft: false
---

Using existing capabilities from within an actor is quick and easy. If an actor interface exists for the type of capability _contract_ you're looking to use, then it's just a matter of declaring a reference to it from inside your code. Remember that your actors depend only on the _interface_. The _implementation_ of a contract is entirely up to the provider. For instance, once your actor is designed to work against the `wasmcloud:keyvalue` contract, it automatically works with _any_ provider that implements that contract.

### Find an interface

If you're looking to see which types of supported, first-party capability provider contracts are available, you'll want to take a look at the [interfaces](https://github.com/wasmCloud/interfaces/) repository. Here you will find links to documentation as well as a list of which language-specific interfaces are available, and links to multiple implementations of the same contract (e.g. _file system_ and _S3_ are two different implementations of `wasmcloud:blobstore`).

### Add the interface as a dependency

It should also be very easy to simply declare a dependency on the interface from within your actor project. Remember that you're taking a dependency on the _abstract contract_, and not the concrete implementation. You might be declaring a dependency on the `wasmcloud:keyvalue` contract, and not on Redis or Cassandra.

By convention, all of our first-party actor interface crates start with the prefix `wasmcloud-interface` and should be easy to find on [crates.io](https://crates.io/search?page=1&per_page=10&q=wasmcloud-interface).

As an example, here's what it looks like to add a dependency on the **key-value** actor interface. In `Cargo.toml`, there needs to be an entry under `[dependencies]`:

```toml
wasmcloud-interface-keyvalue = "0.5.0"
```

And in the Rust source (`src/lib.rs`), it needs to be imported:

```rust
use wasmcloud_interface_keyvalue::*;
```

### Sign the actor

Before an actor can use a capability provider, it needs to be signed with the capability id. The signing process takes a WebAssembly file (with `.wasm` extension), generates a JWT containing the list of capability claims, signs the JWT with your private signing key, and generates a file ending in `_s.wasm` containing the original WebAssembly plus the JWT.

Using the wasmCloud Makefiles (which you can get from a project in the [examples](https://github.com/wasmCloud/examples) repository, or a from project generated with `wash new actor`), the signing is done automatically for you, using the claims declared in the Makefile

```make
CLAIMS = wasmcloud:httpserver
```
Whenever you type `make`, the Makefile's rules execute the command `wash claims sign ...` to sign the actor module.

You can use the command `wash claims inspect` to show the capability claims of a signed actor.
