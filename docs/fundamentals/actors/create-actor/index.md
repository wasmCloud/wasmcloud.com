---
title: "Creating an actor"
date: 2018-12-29T12:00:00+00:00
sidebar_position: 2
draft: false
---

To perform the steps in this guide, you'll need to have completed [installation](/docs/installation.mdx) of the wasmCloud host and prerequisites, and if you're using Rust, the wasm32 target installed:

```shell
rustup target add wasm32-unknown-unknown
```

This guide will walk you through the following steps to create an actor:

- [Generating a new actor project](./generate)
- [Running the actor](./run)
- [Customizing the actor and using the hot-reload feature](./update)
