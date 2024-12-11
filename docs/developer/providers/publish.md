---
title: 'Publish'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 4
draft: false
---

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
