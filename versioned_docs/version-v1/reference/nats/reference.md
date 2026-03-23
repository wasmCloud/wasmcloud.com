---
title: 'NATS Reference'
description: 'Complete NATS reference for wasmCloud deployments'
sidebar_position: 12
---

wasmCloud uses many NATS features across its stack, primarily relying on NATS JetStream for persistent distributed storage and NATS core request/reply for RPC.

## NATS APIs Used

### Wasm Remote Procedure Calls with wRPC

- **NATS core request/reply and Queue Groups**
  - https://docs.nats.io/nats-concepts/core-nats/reqreply
- **NATS core queue groups**
  - https://docs.nats.io/nats-concepts/core-nats/queue

### wasmCloud Control Interface

- **NATS core request/reply** for API server, clients (wash), pluggable secrets backends, pluggable policy, direct communication with providers
  - https://docs.nats.io/nats-concepts/core-nats/reqreply
- **NATS core publish** for CloudEvents
  - https://docs.nats.io/nats-concepts/core-nats/pubsub
- **NATS JetStream KV** for socializing LATTICEDATA (links) and CONFIGDATA (user configuration for components and capability providers)
  - https://docs.nats.io/nats-concepts/jetstream/key-value-store

### wadm

- **NATS core request/reply** for API server and clients (wash)
  - https://docs.nats.io/nats-concepts/core-nats/reqreply
- **NATS JetStream KV** for manifest and state storage
  - https://docs.nats.io/nats-concepts/jetstream/key-value-store
- **NATS JetStream Streams** for work queues
  - https://docs.nats.io/nats-concepts/jetstream/streams
- **NATS JetStream mirror stream** for capturing wasmCloud events
  - https://docs.nats.io/nats-concepts/jetstream/source_and_mirror

## Summary

wasmCloud makes use of:

- NATS Core Request/Reply
- NATS Core Publish/Subscribe
- NATS JetStream Mirror Streams (with v2.10+ features)
- NATS JetStream Key/Value Storage
- NATS NKeys for additional authentication and signing
  - Does not require NATS explicitly, it's just the use of keys

## Reference Sections

- **[NATS Subjects](/docs/reference/nats/subjects)** - Complete subject reference for wRPC, control interface, and wadm API
- **[NATS Streams and Buckets](/docs/reference/nats/streams-and-buckets)** - JetStream resource requirements and production configuration
- **[NATS Permissions](/docs/reference/nats/permissions)** - Account and permission configuration for secure deployments
- **[NATS Leaf Nodes](/docs/reference/nats/leaf-nodes)** - Leaf node strategy and architectural patterns

## See Also

- [NATS Ecosystem Overview](/docs/ecosystem/nats/) - Conceptual overview of NATS in wasmCloud
- [NATS Deployment Guide](/docs/category/provisioning-nats/) - Deployment-specific NATS configuration
- [NATS Documentation](https://docs.nats.io/) - Official NATS documentation
