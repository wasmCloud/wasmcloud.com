---
title: 'Publish'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 4
draft: false
---

:::warning[Planned changes to providers]
The [**wasmCloud Q3 2025 Roadmap**](https://github.com/orgs/wasmCloud/projects/7) sets out plans for an overhaul to capability providers in the next major release of wasmCloud. This overhaul transitions providers to a "wRPC server" model in which WIT interfaces are served via one of the transports available with wRPC (e.g., TCP, NATS, QUIC, or UDP), enabling capability implementations to be written in any language and to be deployed independently in containers. 

For more information, see the [Roadmap](https://github.com/orgs/wasmCloud/projects/7), [Issue #4642: “Transition the capability provider model into support for wRPC servers,”](https://github.com/wasmCloud/wasmCloud/issues/4642) and [Issue #4636: "Support configuring a wasmCloud host with shared capability providers."](https://github.com/wasmCloud/wasmCloud/issues/4636)
:::

You can publish your provider to any OCI compliant registry that supports **OCI artifacts**. These artifacts are not container images, but conform to OCI standards and may be stored on any OCI-compatible registry. See the [Packaging](/docs/concepts/packaging.mdx) page for more details on how the wasmCloud ecosystem uses OCI artifacts for packaging.

First-party wasmCloud providers are [hosted on GitHub Packages](https://ghcr.io/wasmcloud/wasmcloud), but any OCI-compliant registry is supported. 

You can use [`wash push`](/docs/cli/wash#wash-push) to push your provider to the registry:

```shell
wash push your.registry.io/messaging-nats:0.0.1 /path/to/artifact
```

Once your provider is published, you can use it in application manifests like so:

```yaml
spec:
  components:
    - name: messaging-service-provider
      type: capability
      properties:
        image: your.registry.io/messaging-nats:0.0.1
```

See the wasmCloud Application Deployment Manager (`wadm`) section for complete instructions on [defining an application in a manifest](/docs/ecosystem/wadm/model).
