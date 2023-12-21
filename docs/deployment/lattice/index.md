---
title: "Lattice Management"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 1
draft: false
---

The lattice is a self-forming, self-healing mesh network that provides a unified, flattened topology across any number of disparate environments, clouds, browsers, or even hardware. A lattice allows actors and capability providers to communicate with each other across any number of intervening infrastructure barriers, exposing an “it just works” network optimized for short developer feedback loops as well production performance and resilience.

### Self-forming

With a lattice, there is no need to deploy complex _service discovery_ products or servers, no need to fuss with complicated and potentially error-prone and brittle dynamic DNS systems. Merely by connecting to whichever [NATS](https://nats.io) server you deem appropriate, wasmCloud hosts are automatically aware of each other and everything else of importance running within the lattice.

### Self-healing

The lattice is designed to operate in the presence of network partition events, partially connected endpoints, and hosts that have slow or high-latency connections. Lattices also operate optimally within cloud back-ends or even in small, constrained environments. Endpoints within a lattice and come and go without ever taking the entire system down, and the network graph can change and re-form itself to optimize based on real-time conditions, without requiring applications, actors, or capability providers to be rebuilt or redeployed.

### Flattened topology

Without wasmCloud's lattice, when we deploy mesh networks into a cluster in some cloud environments, those networks are isolated within their cluster. If we want to span multiple clusters, we have to make a bunch of explicit configuration changes, and, more importantly, our application code and operations personnel may have to be intimately aware of the boundaries between networks, clouds, and other infrastructure zones.

With lattice, it simply doesn't matter. As long as any two endpoints in the lattice can somehow reach each other over any number of intervening hops across any kind of disparate infrastructure, those endpoints can be part of the same lattice. As we'll describe throughout this reference documentation, the combination of the power of **NATS**, _leaf nodes_, and pub/sub messaging (as opposed to strict point-to-point calls) allows for extremely flexible deployments that are still fast, secure, and easily maintained.
