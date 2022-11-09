---
title: "Getting Started"
date: 2018-12-29T11:02:05+06:00
weight: 1
draft: false
---

Getting started with application development with wasmCloud is simple. The first thing you'll need to do is follow the [installation](/overview/installation) steps to install `wash`. wasmCloud supports [TinyGo](https://tinygo.org/getting-started/install/) and [Rust](https://www.rust-lang.org/tools/install) for actor development. Ensure you have a toolchain installed for your preference of language, the following guides have both examples so you can follow along.

Before you can build [actors](/reference/host-runtime/actors) with Rust, you'll need to have the `wasm32-unknown-unknown` target added to your environment. You can set this up by executing the following command:

```shell
rustup target add wasm32-unknown-unknown
```

Let's get started by creating an actor.