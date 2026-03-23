---
title: 'Intro'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 0
draft: false
---

:::warning[Planned changes to providers]
The [**wasmCloud Q3 2025 Roadmap**](https://github.com/orgs/wasmCloud/projects/7) sets out plans for an overhaul to capability providers in the next major release of wasmCloud. This overhaul transitions providers to a "wRPC server" model in which WIT interfaces are served via one of the transports available with wRPC (e.g., TCP, NATS, QUIC, or UDP), enabling capability implementations to be written in any language and to be deployed independently in containers. 

For more information, see the [Roadmap](https://github.com/orgs/wasmCloud/projects/7), [Issue #4642: “Transition the capability provider model into support for wRPC servers,”](https://github.com/wasmCloud/wasmCloud/issues/4642) and [Issue #4636: "Support configuring a wasmCloud host with shared capability providers."](https://github.com/wasmCloud/wasmCloud/issues/4636)
:::

Providers are executable host plug-ins&mdash;stateful, standalone processes that fulfill non-functional requirements for stateless components. For a high-level introduction to providers and why you might want to build one, see [Providers in the Concepts](/docs/concepts/providers/) section.

Here, you can learn how to build your own provider. We'll walk you through implementing your own messaging provider for NATS, and you can use the same process to implement a capability provider using standard interfaces like `wasi:http`, `wasi:keyvalue`, `wasi:blobstore`, and `wasmcloud:messaging`.

We'll work through the following steps:

- [Create](/docs/developer/providers/create): Create a new messaging provider from a template using `wash` and implement the `wasmcloud:messaging` interface.
- [Build](/docs/developer/providers/build): Compile the provider artifact.
- [Test](/docs/developer/providers/test): Test the provider in a local wasmCloud environment.
- [Publish](/docs/developer/providers/publish): Publish the provider to an OCI registry.
