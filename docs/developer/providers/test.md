---
title: 'Test'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 3
draft: false
---

:::warning[Planned changes to providers]
The [**wasmCloud Q3 2025 Roadmap**](https://github.com/orgs/wasmCloud/projects/7) sets out plans for an overhaul to capability providers in the next major release of wasmCloud. This overhaul transitions providers to a "wRPC server" model in which WIT interfaces are served via one of the transports available with wRPC (e.g., TCP, NATS, QUIC, or UDP), enabling capability implementations to be written in any language and to be deployed independently in containers. 

For more information, see the [Roadmap](https://github.com/orgs/wasmCloud/projects/7), [Issue #4642: “Transition the capability provider model into support for wRPC servers,”](https://github.com/wasmCloud/wasmCloud/issues/4642) and [Issue #4636: "Support configuring a wasmCloud host with shared capability providers."](https://github.com/wasmCloud/wasmCloud/issues/4636)
:::

To test a provider, we can run it in a local wasmCloud environment, interacting with a real host and real components. To set up the environment:

1. Run a local development environment with `wash up`
1. Build the provider with `wash build`
1. Using a `wadm.yaml` application manifest that includes the path to your provider, `wash app deploy wadm.yaml` to deploy your application
   1. Alternatively, start the provider with `wash start provider ./path/to/provider.par.gz`
   1. Start a component that interacts with the provider with `wash start component`, then [link](/docs/concepts/linking-components/) the two together
1. Invoke the component or provider directly to test

To see an example of this, refer to the [create](/docs/developer/providers/create.md#testing-the-provider) section for capability providers.
