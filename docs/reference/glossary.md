---
title: 'Glossary'
date: 2020-05-01T00:00:00+00:00
description: 'Glossary of Terms'
sidebar_position: 1
type: 'docs'
---

The following is a glossary of important or frequently used terms. These terms may have meanings or assumed context outside wasmCloud, and so these definitions should help to clarify how wasmCloud defines them.

## Components

A component is the smallest deployment of compute within a wasmCloud cluster. Components are `.wasm` files that have been cryptographically signed with claim attestations indicating what they can and cannot do. For more information, see [components](/docs/concepts/components).

## Providers

"Capability Providers" or more commonly "Providers" fulfill non-functional requirements like HTTP handling or key-value storage as managed by an abstraction called a **capability**. For more information, see [providers](/docs/concepts/providers).

## Lattice

The lattice is a self-forming cluster of wasmCloud nodes. Each lattice is uniquely identified by a name, which is used to differentiate traffic from other lattices. Membership within a lattice requires a secret key for signing invocations and the ability to trust a specific set of public keys from other hosts. For more information, see [lattice management](/docs/deployment/lattice).
