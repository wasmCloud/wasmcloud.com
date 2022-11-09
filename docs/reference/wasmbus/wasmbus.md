---
title: "wasmbus"
date: 2018-12-29T11:02:05+06:00
weight: 4
draft: false
---

If you know in advance the memory and data exchange characteristics of your WebAssembly modules, and you know the lifetimes of the data being exchanged, and you can predict the kind of long-lived pointer behavior you’ll have, then by all means use every tool and code generator at your disposal (e.g. [wasm-bindgen](https://rustwasm.github.io/docs/wasm-bindgen/)).

A large number of use cases for WebAssembly fall into this pattern--treating the `.wasm` file much like a precompiled dependency with strongly-typed wrappers (think of how a compiler generates typed shims based on usage to support _generics_) similar to a dynamically-loaded library (.so, .dll, .dylib, etc).

However, what if the runtime host you’re building might be loading and unloading modules with unpredictable lifetimes, from myriad sources compiled in unknown languages with unknown memory allocation and garbage collection? It sounds like a remote edge case, but if we want to be able to treat WebAssembly modules like portable, distributed units of compute that can seamlessly flow from cloud to edge and anywhere in between, then this is precisely the kind of use case we need to support.

If we can’t predict the allocation behavior of the module’s memory, and we can’t afford long-lived pointers because we could unload a module with active, stateful references, how then do we create a reliable protocol for bi-directional communication between guests and hosts?

This is the problem that **wasmbus** is designed to address. Once people reach the point in their WebAssembly journey where they realize that merely passing numbers back and forth is not sufficient, invariably they decide that they need a robust, bi-directional protocol for crossing the guest-host boundary.
