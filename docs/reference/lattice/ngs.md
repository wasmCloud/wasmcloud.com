---
title: "NGS as an infrastructure bridge"
date: 2018-12-29T11:02:05+06:00
weight: 9
draft: false
---

**_[NGS](https://synadia.com/ngs)_** is a global communications system built on top of NATS. Think of it as a universal, public "[dial tone](https://en.wikipedia.org/wiki/Dial_tone)", that you can use to connect any endpoint to any other endpoint in the world, all without ever opening an internal firewall port.

When you combine the power of [NATS leaf nodes](./leaf-nodes) with the ability to connect to a global network of NATS infrastructure through a single URL, the possibilities grow exponentially.

For example, any time you need to connect multiple disparate infrastructures that are not open to each other through a secure tunnel, you can simply use NATS leaf nodes at the edge of each infrastructure that use NGS as a bridge. The NGS security context remains completely isolated from the security context(s) of your application. It's also worth pointing out that NATS supports _web sockets_ as well, giving you access to wasmCloud host runtimes that are running in a browser. In fact, our [JavaScript host runtime](https://github.com/wasmCloud/wasmcloud-js) relies on web sockets for its NATS access.

Effectively, this gives you the ability to control traffic segmentation and the "interest graph" of the various nodes connected within a lattice, but as far as the lattice (and its [control interface](../lattice-protocols/control-interface)) are concerned, everything is just a single, flat topology.

Lattice with NATS and NGS really is the best of all worlds: a layered, optimized, hierarchical security and traffic flow topology hidden behind a single, flat control interface.
