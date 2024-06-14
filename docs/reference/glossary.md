---
title: 'Glossary'
date: 2020-05-01T00:00:00+00:00
description: 'Glossary of Terms'
sidebar_position: 1
type: 'docs'
---

## Core wasmCloud terminology

The following is a glossary of important or frequently used terms. These terms may have meanings or assumed context outside wasmCloud, and so these definitions should help to clarify how wasmCloud defines them.

### Built-in provider

Built-in providers are functionalities exposed by the wasmCloud host, such that the host itself can fulfull a component's imports on certain interfaces. Built-in providers may be linked with components. This limited set of functions for capabilities such as **logging** represents wasmCloud's **trusted compute base**. 

For more information, see [**Providers**](/docs/concepts/providers).

### Capability

An abstraction for a given functionality (such as key-value storage or connection over HTTP), usually facilitated by a provider. For this reason, [providers](#provider) are sometimes called "capability providers."

### Component

Components are portable, interoperable WebAssembly binaries that implement stateless logic. Components are `.wasm` files that include [interface](#interfaces) definitions which define the contracts through which they may relate to other entities. 

For more information, see [**Components**](/docs/concepts/components).

### Host

A wasmCloud host is a runtime environment node consisting of a WebAssembly runtime ([Wasmtime](#wasmtime)) and additional layers of security and functionality. Multiple hosts may run on a single machine and hosts are meant to be ephemeral. 

For more information, see [**Hosts**](/docs/concepts/hosts/).

### Interface

Interfaces are contracts that define the relationships between entities like components and providers, often defining functionalities like HTTP or key-value storage at a high and vendor-agnostic level. Interfaces describe a component or provider's requirements ("imports") and exposed functions that may be used by other entities ("exports"). Interfaces are defined in [WebAssembly Interface Type (WIT)](#wit) files. 

For more information, see [**Interfaces**](/docs/concepts/interfaces/).

### Lattice

The lattice is a self-forming cluster of wasmCloud nodes. Each lattice is uniquely identified by a name, which is used to differentiate traffic from other lattices. Membership within a lattice requires a secret key for signing invocations and the ability to trust a specific set of public keys from other hosts. 

For more information, see [**Lattice**](/docs/concepts/lattice).

### Link

A link is a connection between a component or provider's *requirements* (**"imports"**) and the *exposed functions* (or **"exports"**) of another entity. 

For more information, see [**Linking Components**](/docs/concepts/linking-components/).

### NATS

NATS is the connective technology for distributed systems used to form the wasmCloud [lattice](#lattice). NATS is governed by the Cloud Native Computing Foundation. 

For more information, see the [**NATS documentation**](https://docs.nats.io/).

### Provider

Providers are executable host plugins that implement longer-lived processes, typically providing reusable capabilities (such as key-value storage). Providers are written in Rust or Go, may be linked to one or more components, and interact with components according to defined [interfaces](#interfaces). 

For more information, see [**Providers**](/docs/concepts/providers).

### `wadm`

`wadm` is shorthand for **wasmCloud Application Deployment Manager**, the part of the wasmCloud platform that manages declarative application deployments. 

For more information, see [**wasmCloud Application Deployment Manager**](/docs/ecosystem/wadm/).

### `wash`

`wash` is shorthand for **wasmCloud Shell**, the primary CLI tool for interacting with the wasmCloud platform. Using `wash`, you can build components, view component interfaces, start a local instance of wasmCloud, and more. 

For more information, see [**wasmCloud Shell**](/docs/ecosystem/wash/).

### Wasmtime

Wasmtime is the WebAssembly runtime utilized by the wasmCloud host. Wasmtime is maintained by the Bytecode Alliance and may be used as a standalone tool. 

For more information, see the [**Wasmtime documentation**](https://docs.wasmtime.dev/).

### wRPC

wRPC stands for "WIT over RPC"&mdash;or if you want to decode it completely, **WebAssembly Interface Type over Remote Procedure Call**. wRPC is an RPC protocol for communicating according to WIT definitions over a transport layer; this is the means by which wasmCloud can dynamically link distributed WebAssembly components at runtime over the lattice. 

For more information, see [**Linking at Runtime**](/docs/concepts/linking-components/linking-at-runtime).

## General WebAssembly terminology

The following are common terms in the WebAssembly ecosystem that will come up frequently when working with wasmCloud.

### The Component Model

The Component Model is a specification for WebAssembly binaries that enables them to **interoperate**&mdash;meaning that a component written in one language (Rust, for example) can communicate with a component written in another language (such as Go) using shared types and functions. When we talk about [components](#component) in wasmCloud, we are simply talking about standard WebAssembly components conforming to the Component Model, which may run anywhere else that runs components. 

For more information on components and the Component Model, see [**Components**](/docs/concepts/components/) or the [**Component Model documentation**](https://component-model.bytecodealliance.org/).

### Module

WebAssembly modules are units of code conforming to the core WebAssembly specification. These are sometimes contrasted with components, but components are modules with an additional layer of specification to the Component Model. 

For more information, see the [**WebAssembly core specification**](https://webassembly.github.io/spec/core/syntax/modules.html). 

### Wasm

Wasm is shorthand for [WebAssembly](#webassembly).

### WebAssembly

WebAssembly is a bytecode format paired with a virtual instruction set architecture that can serve as a compilation target for any language. Developers can compile code from a given language to a very small binary that runs on what is essentially a tiny virtual machine, enabling that code to run in any environment, including browsers, servers, edge devices, clouds, and more. 

For more information, see [**WebAssembly.org**](https://webassembly.org/). 

### WebAssembly Interface Type (WIT)

WIT stands for "**WebAssembly Interface Type**." WIT is an [interface description language](https://en.wikipedia.org/wiki/Interface_description_language) used to define the high-level interfaces used by components, such as the APIs included in [WASI](#webassembly-system-interface-wasi). In wasmCloud, all interfaces are defined in WIT. 

For more information on WIT, see the [**Component Model documentation**](https://component-model.bytecodealliance.org/design/wit.html).

### WebAssembly System Interface (WASI)

WASI stands for "**WebAssembly System Interface**" and refers to a group of standard APIs for use by WebAssembly binaries. WASI is developed and maintained by the WASI Subgroup in the W3C WebAssembly Community Group. WASI interfaces are sometimes called "proposals" as they move through a multi-stage proposal process before being accepted as a standard. You may see the second major WASI release referred to variously as WASI 0.2, WASI P2, or WASI Preview 2. 

For more information, see [**WASI.dev**](https://wasi.dev/).

## Don't see a term here?

Try the search bar in the site menu (or by pressing CTRL+K) or [open an issue](https://github.com/wasmCloud/wasmcloud.com/issues/new).