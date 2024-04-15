---
sidebar_position: 0
---

# What is wasmCloud?

wasmCloud is a **universal application platform** that helps you build and run globally distributed WebAssembly applications on any cloud and any edge.

Our goal is to make development more joyful and efficient by giving developers the tools to write only the code that matters&mdash;and making it easy to run that code anywhere.

:::warning[Under Construction]
🚧 This is pre-release documentation for wasmCloud 1.0 under active construction.

* The most current pre-release version of the **wasmCloud 1.0 host** is **v1.0.0-alpha.4**, which is [available on GitHub](https://github.com/wasmCloud/wasmCloud/releases/tag/v1.0.0-alpha.4).
* The most current pre-release version of **`wash-cli`** is **0.27.0-alpha.1**, which is available to install with [cargo](https://github.com/rust-lang/cargo): `cargo install wash-cli --version 0.27.0-alpha.1`

The `wash` pre-release enables you to test build functionality. Deployment functionality requires a 1.0-compatible version of `wadm`, which is not yet available but will release very soon.

Some details on these pages may not be aligned with v1.0 during the pre-release period. 🚧
:::

wasmCloud leverages WebAssembly's security, portability, and performance to compose applications from tiny, independent building blocks.

These building blocks are managed declaratively and reconfigurable at runtime. You shouldn't need to recompile your whole app to upgrade a database client or patch a vulnerability. You shouldn't need to recompile _anything_ to move your app from development to production.

wasmCloud is designed around the following core tenets:

* Distributed from day one
* Run anywhere and everywhere
* Secure by default
* Faster iteration and lower maintenance

**Move from concept to production without changing your design, architecture, or your programming environment.**

### Still have questions?

Check out our [FAQ](/docs/reference/faq).
