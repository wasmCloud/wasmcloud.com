---
title: 'Host Requirements'
date: 2018-12-29T11:02:05+06:00
sidebar_position: 5
draft: false
description: 'Requirements and conditions all hosts must meet'
---

In the preceding section of the documentation, we talked about how there are no restrictions in place preventing developers from building their own bespoke wasmCloud hosts that are optimized for specific environments.

In this section, we'll talk about the specification and requirements for wasmCloud
hosts written from scratch, either for internal use or community contribution (e.g. a custom host for an ESP32 microcontroller, etc).

If you want to make your own wasmCloud host, you're likely doing so because you want to add a new device, platform, or operating system to the ecosystem, to co-exist with first-party wasmCloud hosts and interact with the lattice. The following requirements for hosts will give you the recipe you need to create your own host.

### Host requirements

The host must perform the following activities:

- Use the [RPC channel](/docs/0.82/hosts/lattice-protocols/rpc) to perform periodic (default every 30 seconds) health checks. Emit the appropriate events to indicate health check success or failure.
- Use the RPC channel to send messages on `...linkdefs.put` and `...linkdefs.del` topics to alert capability providers as to when actors are linked.
- Expose some form of API that can be used to start and stop actors
  - Actors must communicate with the host using the appropriate ABI.
  - The host does not need to use any other code generation facilities, as long as the host is able to use _messagepack_ for the serialization format for messages, such as link definitions, rpc invocations, and health checks.
- Have the ability to pull from OCI registries to start actors. The host will only need to pull provider archive (PAR) files from registries if the custom host supports starting providers.
- _Optionally_ expose an API that is used to start and stop providers. Custom wasmCloud hosts do not need to support internal capability providers and can instead simply communicate with them over NATS.
- Validate the JWT embedded in actors and in provider archives, including `not-before`, `expires`, and the actor claims (prevent actors from communicating with provider contracts not listed in the claims).
- Generate a new `nkey` pair for the host upon startup. This is used for the public key to identify the host.
- Generate a _cluster seed_, or accept an existing one, for signing invocations
- Properly sign invocations, including hashing specific fields of the invocation.
- Subscribe to the appropriate lattice subjects for:
  - **RPC** - each actor must subscribe to its appropriate lattice RPC subject
  - **[Control Interface](/docs/0.82/hosts/lattice-protocols/control-interface)** - the host must subscribe to the control interface subject(s) and respond in accordance with the interface protocol.
  - Events - What the custom host does with the events is up to the host, but the host _must_ emit all expected events on the control connection as JSON **CloudEvents**. See the reference for the full list of required [CloudEvents](../../reference/cloud-event-list)
- Ensure that the `Invocation` that is sent via RPC contains a properly signed JWT with the proper invocation hash (anti-forgery token implementation). First-party wasmCloud hosts will reject invocations that do not include these.
- Ensure that all link definitions, OCI reference maps, and claims are properly stored in the [NATS JetStream Key-Value bucket](/docs/0.82/deployment/lattice/metadata).
