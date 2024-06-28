---
title: 'Test'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 3
draft: false
---

To test a provider, we can run it in a local wasmCloud environment, interacting with a real host and real components. To set up the environment:

1. Start a new local OCI registry. You can download the [Docker Compose YAML file](https://github.com/wasmCloud/wasmCloud/blob/main/examples/docker/docker-compose-full.yml) and run `docker compose up -d registry`. You'll also need to [allow unauthenticated OCI registry access](/docs/developer/workflow/#allowing-unauthenticated-oci-registry-access) before starting the wasmCloud host.

2. Upload the newly-created _provider archive_ to the local OCI registry (You can use `wash push ...`, or if you have one of the provider project Makefiles, `make push`) `make start` to start it.

3. Upload a component that utilizes the provider to the local OCI registry (`wash build` from the component source folder to compile it, sign it, and then use `wash push` to upload it to the registry). Then, use `wash start` to start the actor from the local registry.

4. Link the component in your Wadm manifest.

5. Invoke the component.

To see an example of this, refer to the [create](/docs/developer/providers/create.md#testing-the-provider) section for capability providers.
