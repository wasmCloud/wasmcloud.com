---
title: "Glossary"
date: 2020-05-01T00:00:00+00:00
description: "Glossary of Terms"
sidebar_position: 1
type: "docs"
---

The following is a glossary of important or frequently used terms. These terms may have meanings or assumed context outside wasmCloud, and so these definitions should help to clarify how wasmCloud defines them.

## Actors
An actor is the smallest deployment of compute within a wasmCloud cluster. They are `.wasm` files that have been cryptographically signed with claim attestations indicating what they can and cannot do. For more information, see [actors](../fundamentals/actors).

## Capability Providers
"Capability Provider", "Capability", or most commonly called "Provider" is any form of side effect that can be produced by an actor. In other words, capabilities are the means by which actors, otherwise isolated and sandboxed, can perform high-level I/O. For more information, see [capability model](../fundamentals/capabilities).

## Lattice
The lattice is a self-forming cluster of wasmCloud nodes. Each lattice is uniquely identified by a "prefix" which is used to differentiate traffic from other lattices. Membership within a lattice requires a secret key for signing invocations and the ability to trust a specific set of public keys from other hosts. For more information, see [lattice management](../production/lattice).

## Provider Archive
The provider archive is a file that is basically a `.tar.gz` file that contains a number of OS and CPU specific binaries, as well as a JWT containing the claims that belong to that capability provider. For more information, see [creating a provider archive](../fundamentals/capabilities/create-provider/create-par).
