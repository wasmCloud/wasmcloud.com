---
title: "Roadmap"
date: 2023-08-02T00:00:00+00:00
description: "wasmCloud Development Roadmap"
sidebar_position: 6
---

:::info
This roadmap page is a snapshot of the current state of the project. It is not a guarantee of future direction or features. It is a living document and will change as the project evolves. You can view the most current version of this roadmap on [GitHub Projects](https://github.com/orgs/wasmCloud/projects/7/views/3).
:::

wasmCloud is a constantly evolving project. The feature roadmap and release schedule aren't rigid at this time, instead, we're adopting a "Now, Next, Later" format to indicate when efforts are available for work. In addition to the higher-level roadmap on [GitHub Projects](https://github.com/orgs/wasmCloud/projects/7/views/3), wasmCloud is under constant development for smaller improvements, bug fixes, and documentation. wasmCloud seeks to evolve with the WebAssembly ecosystem, adopting standards and best practices as they become available. We believe this is the best way, after hearing invaluable feedback from contributors and users, to accomplish our goals as a project.

## Goals

Looking at wasmCloud development in the longer-term, we strive to achieve the following goals:

1. **Leverage as many WebAssembly standards as possible (WASI, Wasm components, wasi-cloud, etc)**
1. Provide a seamless developer experience for building, testing, and deploying WebAssembly components
1. Be the best way to build vendor-less components for WebAssembly applications
1. Bring joy to distributed computing
1. Leverage cloud-native standards where possible (OAM, OCI, CloudEvents, etc.)

wasmCloud began in 2019 with the goal of securely connecting capabilities to applications, leveraging WebAssembly to provide a language and platform agnostic unit of compute. This loose coupling of capabilities and applications is the core of wasmCloud's ability to bring joy to distributed computing, allowing application developers to: maintain their business logic and non-functional requirements separately, build without the intricacies of platform-specific dependencies, and seamlessly distribute applications without changing their code.

## wasmCloud Q3/Q4 2023 Roadmap

The first goal above is the focus of our current (as of 01 August 2023) efforts. Inspired by the Bytecode Alliance blog [WebAssembly: An Updated Roadmap for Developers](https://bytecodealliance.org/articles/webassembly-the-updated-roadmap-for-developers), we're working to adopt as many WebAssembly standards as possible.

1. **Leverage [WebAssembly interface types (wit)](https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md) for our interfaces:** we can use and contribute to the wide variety of projects that provide language support for WebAssembly components, extending wasmCloud's language support from Rust and TinyGo to include C, [Javascript](https://github.com/bytecodealliance/jco), [Python](https://github.com/dicej/componentize-py), and more as they become available.
1. **Implement and use [wasi-cloud](https://github.com/WebAssembly/wasi-cloud-core) instead of proprietary wasmCloud interfaces:** letting users bring their own components to wasmCloud instead of requiring them to be built with wasmCloud's SDK.
1. **Transition feature focus to Rust:** Recently accepted as [ADR-0013](https://github.com/wasmCloud/wasmCloud/blob/main/adr/0013-transition-feature-focus-to-rust.md), we aim to focus our efforts on the wasmCloud Rust runtime project to rapidly conform to standards and offer a portable, stable, high-performance wasmCloud runtime.

You can see the status of the above efforts on the [GitHub Projects](https://github.com/orgs/wasmCloud/projects/7/views/3) board. Completing our efforts to adopt WebAssembly standards enables wasmCloud to expand language support, capability implementations, and compatibility with other projects.

## Diagram

Though this picture is difficult to read on this page, you can view the full-size version [here](/img/roadmap-08022023.png).

![wasmCloud Roadmap 08/02/2023](/img/roadmap-08022023.png)

## Contributing

We welcome all contributors to the wasmCloud project, and we'd love to have help to accomplish our goals. If you're interested in contributing, please see our [Contributing Guide](https://github.com/wasmCloud/wasmCloud/blob/main/CONTRIBUTING.md) for more information, and come join us on [Slack](https://slack.wasmcloud.com) to chat with the team and other community members. We try to mark issues that are good for new contributors with the **good first issue** label, so look out for those for well scoped issues that are a good place to start. We also host [weekly community meetings](https://calendar.google.com/calendar/u/0/embed?src=c_6cm5hud8evuns4pe5ggu3h9qrs@group.calendar.google.com) that are open to all, where we can discuss aspects of the roadmap.
