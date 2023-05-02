---
title: "Working with Leaf Nodes"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 5
draft: false
---

A lattice **_leaf node_** is nothing more than a wasmCloud host connected to a lattice via a [NATS leaf node](https://docs.nats.io/nats-server/configuration/leafnodes). Please consult the NATS documentation for detailed information on how to create, configure, manage, and deploy NATS leaf nodes.

What leaf nodes enable for lattice is a way to segment or isolate traffic and/or security boundaries. An extremely common pattern involves starting a NATS leaf node alongside the wasmCloud host runtime. The leaf node allows the wasmCloud host to authenticate anonymously because it's configured to only accept localhost connections. Meanwhile, this same leaf node can be securely connected to a cluster elsewhere, optionally limiting the access of the connected clients.

This is just the tip of the iceberg. NATS leaf nodes can be used to string together disparate infrastructures, multiple private cloud environments, and much more. Their simplicity is the key to their power and we strongly encourage you to fully absorb the documentation to inspire better lattice configuration possibilities.

For more information on this and other security patterns, consult the [security patterns](./security-patterns) lattice reference.

This segmentation or isolation is _ideal_ for bridging disparate infrastructure. Using leaf nodes at the "edges" or boundaries of your infrastructure allows the lattice to continue to expose a single, flat topology while NATS and leaf nodes take care of all the hard work of optimizing traffic patterns for the interest graph across an arbitrarily complex network.

As another example, you could use a leaf node to service all of the lattice traffic for an on-premise sub-portion of the network, which could be a warehouse or a retail facility or even a cluster of IoT devices. This leaf node could then connect back to a cloud, the same cloud connected to by multiple other leaf nodes that allow traffic bridging from wasmCloud hosts running in browsers, on IoT devices, on laptops, and in multiple clouds.

We are not exaggerating at all when we say that the true power of the lattice comes from NATS, and by extension, NATS leaf nodes.
