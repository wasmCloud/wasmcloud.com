---
title: 'Intro'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 0
draft: false
---

Providers are executable host plug-ins&mdash;stateful, standalone processes that fulfill non-functional requirements for stateless components. For a high-level introduction to providers and why you might want to build one, see [Providers in the Concepts](/docs/1.0/concepts/providers) section.

Here, you can learn how to build your own provider. We'll walk you through implementing your own messaging provider for NATS, using standard interfaces like `wasi:http`, `wasi:keyvalue`, `wasi:blobstore`, and `wasmcloud:messaging`.

We'll work through the following steps:

- [Create](./create): Create a new messaging provider from a template using `wash`.
- [Build](./build): Compile the provider artifact.
- [Test](./test): Test the provider in a local wasmCloud environment.
- [Publish](./publish): Publish the provider to an OCI registry.

1. "custom implement" Messaging capability provider `wasmcloud:messaging` for NATS (run through our provider)

   - "use this guide if you want to implement `wasi:http`, `wasi:keyvalue`, `wasi:blobstore`, `wasmcloud:messaging`
   - `wash new provider nats-messaging`

1. Custom provider impl for predefined interface `wasmcloud:example:foobar` TODO: create a github issue to add documentation here
   - "use this guide if you want to define your own interface"
   - `wash new provider custom`

```wit
package foo:bar

interface in {
    func() -> string;
}

interface out {
    func(num: number) -> string;
}

world example-custom {
    import in;

    export out;
}
```

1. Link to concepts page for motivation

:::warning[Under Construction]
🚧 This page is under heavy renovation for wasmCloud 1.0. Check back soon! 🚧
:::
