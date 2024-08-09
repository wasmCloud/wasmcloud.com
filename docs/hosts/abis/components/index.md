---
title: 'Components (wit)'
date: 2024-08-09T11:02:05+06:00
sidebar_position: 4
draft: false
description: 'Support for wit-defined WebAssembly components'
---

The wasmCloud host communicates with WebAssembly guests using the [WebAssembly component model](https://github.com/WebAssembly/component-model). You can read more about components in our [Platform Overview](https://wasmcloud.com/docs/concepts/components).

### Reference

Previously wasmCloud had a purpose-built ABI called [wasmbus](https://wasmcloud.com/docs/0.82/hosts/abis/wasmbus/) for communicating with Wasm guests, but it did not provide portability between runtimes or a standard way to communicate between host and guest.
