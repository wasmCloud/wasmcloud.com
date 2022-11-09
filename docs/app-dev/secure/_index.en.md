---
title: "Securing a wasmCloud App"
date: 2018-12-29T11:02:05+06:00
weight: 7
draft: false
---

This section of the documentation provides an overview of securing wasmCloud applications. This refers specifically to securing the wasmCloud host process, securing command-line tooling, and ensuring the security of a lattice and supporting infrastructure.

The wasmCloud team strongly believes in the practice of _defense in depth_, and as such you'll see throughout this section that many of the security patterns and practices revolve around _not trusting_ other parts of the system.

If you're looking for patterns on how to implement _user security_ (e.g. OAuth), then you'll want to look for examples of this in our [reference apps](/reference/refapps) section.