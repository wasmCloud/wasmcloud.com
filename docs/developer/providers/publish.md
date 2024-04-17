---
title: 'Publish'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 4
draft: false
---

When you're ready to publish your provider, you can push it to an OCI registry. First-party wasmCloud providers are [hosted on GitHub Packages](https://ghcr.io/wasmcloud/wasmcloud), for example, but any OCI-compliant registry is supported.

You can use [`wash push`](/docs/cli/push) to push your provider to the registry:

```shell
wash push your.registry.io/messaging-nats:0.0.1 /path/to/artifact
```

Once your provider is published, you can use it in Wadm manifests like so:

```yaml
spec:
  components:
    - name: messaging-service-provider
      type: capability
      properties:
        image: your.registry.io/messaging-nats:0.0.1
```

See the Wadm section for complete instructions on [defining an application in a Wadm manifest](/docs/ecosystem/wadm/model).
