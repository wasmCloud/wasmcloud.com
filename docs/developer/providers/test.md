---
title: 'Test'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 3
draft: false
---

To test a provider, we can run it in a local wasmCloud environment, interacting with a real host and real components. To set up the environment:

1. Run a local development environment with `wash up`
1. Build the provider with `wash build`
1. Using a `wadm.yaml` application manifest that includes the path to your provider, `wash app deploy wadm.yaml` to deploy your application
   1. Alternatively, start the provider with `wash start provider ./path/to/provider.par.gz`
   1. Start a component that interacts with the provider with `wash start component`, then [link](/docs/concepts/linking-components/) the two together
1. Invoke the component or provider directly to test

To see an example of this, refer to the [create](/docs/developer/providers/create.md#testing-the-provider) section for capability providers.
