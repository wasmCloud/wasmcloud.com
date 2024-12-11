---
title: 'Official OCI Artifact List for Capability Providers'
date: 2018-12-29T11:02:05+06:00
sidebar_position: 2
draft: false
---

We maintain all officially supported, continually updated, first-party OCI artifacts managed by the wasmCloud team on GitHub repositories.

These artifacts are not container images, but conform to OCI standards and may be stored on any OCI-compatible registry. See the [Packaging](/docs/concepts/packaging.mdx) page for more details on how the wasmCloud ecosystem uses OCI artifacts for packaging.

You can find a complete list of the most up-to-date versions and OCI images for all first-party wasmCloud providers on [GitHub Packages](https://github.com/orgs/wasmCloud/packages?repo_name=wasmCloud). The list includes:

- `blobstore-fs`
- `blobstore-s3`
- `http-server`
- `http-client`
- `keyvalue-redis`
- `keyvalue-vault`
- `messaging-nats`
- `messaging-kafka`

The code for providers is maintained [in the wasmCloud repository](https://github.com/wasmCloud/wasmCloud/tree/main/crates/). Refer to the [examples directory](https://github.com/wasmCloud/wasmCloud/tree/main/examples) for the latest updated versions of our example components and providers.
