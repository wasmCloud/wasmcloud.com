---
title: 'NATS Leaf Nodes'
description: 'Leaf node strategy and patterns for wasmCloud'
sidebar_position: 4
---

[Leaf nodes](https://docs.nats.io/running-a-nats-service/configuration/leafnodes) are not required for the wasmCloud deployment but they are strongly recommended.

## Overview

From the NATS documentation:

> Leaf nodes are useful in IoT and edge scenarios and when the local server traffic should be low RTT and local unless routed to the super cluster. NATS' queue semantics are honored across leaf connections by serving local queue consumers first.

## Recommended Architecture

The recommended architecture for wasmCloud is a Hub-Spoke model for edge deployments, or a Hub-Spoke-Spoke for cloud + edge deployments.

### Hub-Spoke

<!-- TODO: Replace with proper diagram -->

<!-- ![Hub-Spoke Architecture](TODO_hub_spoke_diagram.png) -->

The Hub-Spoke pattern provides:

- **Low latency** for local communications
- **Automatic failover** to hub when local services unavailable
- **Simplified configuration** with centralized authentication
- **Edge resilience** during network partitions

### Hub-Spoke-Spoke

<!-- TODO: Replace with proper diagram -->

<!-- ![Hub-Spoke-Spoke Architecture](TODO_hub_spoke_spoke_diagram.png) -->

The Hub-Spoke-Spoke pattern extends the benefits to multi-tier deployments:

- **Cloud-to-edge** connectivity
- **Multi-region** deployments
- **Hierarchical routing** with intelligent traffic optimization
- **Global failover** capabilities

## Benefits

### Traffic Optimization

A powerful feature of leaf nodes is that traffic is kept local whenever possible. For example, if a wasmCloud host issues an invocation, and a target of the invocation is available on the leaf network, the traffic will be routed locally, reducing latency and preventing cross-network traffic.

### Security Segmentation

Leaf nodes enable segmentation or isolation of traffic and/or security boundaries. wasmCloud can use leaf nodes to simplify lattice configuration by delegating NATS authentication to the leaf node, allowing wasmCloud hosts to connect anonymously to localhost.

### Simplified Deployment

This "anonymous localhost" connection pattern is commonly used in the [sidecar](https://docs.microsoft.com/en-us/azure/architecture/patterns/sidecar) pattern, enabling:

- **Credential management** centralized at the leaf node
- **Zero-config** wasmCloud host deployment
- **Infrastructure bridging** across disparate networks

## JetStream Considerations

When using leaf nodes with JetStream, additional configuration is required. See [Leaf Node Config (JetStream)](/docs/deployment/nats/js-leaf) for detailed configuration instructions.

## Global Connectivity

Using leaf nodes with services like [Synadia Cloud](https://www.synadia.com/ngs), the wasmCloud lattice can provide seamless, no-discovery-required, automatic-failover connectivity between hosts anywhere in the world on any infrastructure through any number of intervening firewalls without opening any listening ports.

## See Also

- [NATS Leaf Node Documentation](https://docs.nats.io/running-a-nats-service/configuration/leafnodes)
- [Leaf Nodes & Sidecars](/docs/deployment/nats/leaf-nodes) - Deployment guide
- [Leaf Node Config (JetStream)](/docs/deployment/nats/js-leaf) - JetStream-specific configuration
