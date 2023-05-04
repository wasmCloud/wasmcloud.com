---
title: "Testing the new provider"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 10
draft: false
---

There are two ways to test a capability provider.

The first method loads the provider into a test harness, and issues rpc calls to it to verify responses. This type of testing can be useful for "unit" tests - evaluating the provider in an isolated, controlled context. For examples of providers that use this kind of testing, look in the `tests` folder of [kvredis](https://github.com/wasmCloud/capability-providers/tree/main/kvredis) and [httpserver](https://github.com/wasmCloud/capability-providers/tree/main/httpserver-rs). These two capability providers exhibit different directions for rpc: kvredis, an example of a [`providerReceive`](/docs/hosts/abis/wasmbus/interfaces/traits#wasmbus) service, receives commands from actors, and httpserver, an example of an [`actorReceive`](/docs/hosts/abis/wasmbus/interfaces/traits#wasmbus) service, sends messages to actors.

A second method for testing a provider is to run it in a realistic environment, interacting with a real host and real actors. To set up the environment,

1. Start a new local OCI registry. You can download the [Docker Compose YAML file](https://github.com/wasmCloud/examples/blob/main/docker/docker-compose.yml) and run `docker compose up -d registry`. You'll also need to [allow unauthenticated OCI registry access](/docs/fundamentals/workflow/#allowing-unauthenticated-oci-registry-access) before starting the wasmCloud host.

2. Upload the newly-created _provider archive_ to the local OCI registry (You can use `wash reg push ...`, or if you have one of the provider project Makefiles, `make push`) `make start` to start it.

3. Upload an actor that utilizes the provider to the local OCI registry (`wash build` from the actor source folder to compile it, sign it, and then use `wash reg push` to upload it to the registry). Then, use `wash ctl start` to start the actor from the local registry.
4. Link the actor with `wash ctl link` [on the command line](/docs/fundamentals/actors/create-actor/run#add-a-link-definition) or via the dashboard web UI. For the fakepay provider, no extra configuration parameters values are required for the link command. Note that even if you don't supply configuration values, an actor must be linked to a provider, and be signed with sufficient claims, before it can communicate with the provider.

5. Invoke the actor by sending a JSON payload, either on the command line with `wash call actor -o json --data input.json` or the dashboard UI. The method name invoked, and the parameters in input.json must exactly match the interface implemented by your actor. In the previous section we used `CheckoutRequest` that might have a JSON body as follows:

   ```json
   {
     "payment_entity": "ab3428cj2q34kdas23j0123_123",
     "payment_token": "token1"
   }
   ```

6. Since the response will be serialized in _message pack_ format, the data may look a little awkward in the terminal output, but you'll be able to see your actor using your new provider in the output.
