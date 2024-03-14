---
id: 'index'
title: '2024 Q1 Roadmap'
date: 2023-12-06T00:00:00+00:00
description: 'wasmCloud Development Roadmap on the road to 1.0, scoped to Q1 2024.'
sidebar_position: 998
type: 'docs'
---

# 2024 Q1 Roadmap (wasmCloud 1.0)

:::info
This roadmap page is a snapshot of the current state of the project. It is not a guarantee of future direction or features. It is a living document and will change as the project evolves. You can view the most current version of this roadmap on [GitHub Projects](https://github.com/orgs/wasmCloud/projects/7/views/3).
:::

For our last Roadmap which encapsulated Q3/Q4 of 2023, we adopted a “Now, Next, Later” format to indicate when efforts are available for work. This worked great for us when we were considering our future releases on a rolling basis. Now that we’re looking to take wasmCloud to 1.0, we’ll be using a slightly different nomenclature. Starting with 1.0, our roadmap will be primarily divided into “1.0” tasks and “After 1.0” tasks. After this release, we’ll be dividing tasks into “1.1”, “1.2”, and then a category for major breaking changes in “2.0”. The tasks that are under the upcoming release will be those that are prioritized by wasmCloud maintainers and what we talk about most with our community members. That’s all to say that if there’s a task that’s not on the existing roadmap, as long as it is not a SemVer incompatible change, it can always make it into the upcoming release.

## Goals

On our [previous roadmap](./2023-q3q4.md) we emphasized the importance of embracing common standards, both Wasm and cloud native, and that dedication doesn’t change as we push to 1.0. The Goals section of our roadmaps reflect long standing core tenets of the project, and we’ll continue to strive to achieve the following goals:

1. **Provide a seamless developer experience for building, testing, and deploying WebAssembly components.**
1. Enable developers to build features without vendor lock-in, platform specific dependencies, or language constraints.
1. Leverage and make default as many WebAssembly standards as possible (Wasm components, versioned WITs, and WASI APIs.)
1. Leverage cloud-native standards where possible (OAM, OCI, CloudEvents, OTEL Metrics, Logging and Tracing.)

## Features

wasmCloud as a project aims to offer the following as top features of the 1.0 release:

1. Declarative WebAssembly Orchestration
1. Seamless Distributed Networking
1. Vendorless Application Components
1. Completely OTEL Observable
1. Defense-In-Depth Security By Default

## Roadmap

Looking towards 1.0, we're looking to scrutinize and standardize our APIs and user interaction points. With the release of WASI preview 2 and the component model, it's critical that we provide support for standard WITs and WASI APIs. With the Bytecode Alliance's work on creating adapters to move from one preview release to the next, we're confident that we can move forward with additional WebAssembly changes without major breaking changes. We are already merging changes to pin to wasmtime 16 and the latest WITs, so other than extra implementations of WASI APIs most of the work in this roadmap will be focused on wasmCloud's APIs and user experience.

The [GitHub Roadmap](https://github.com/orgs/wasmCloud/projects/7/views/8) is updated to include a new view, "1.0 (Q1 2024)", which will track all of the work to be included in the 1.0 release. Below is a list of some of the notable RFCs and tasks to complete before the 1.0 release:

1. [Formalize the wasmCloud Control Interface](https://github.com/wasmCloud/wasmCloud/issues/1108)
2. [Support Multiple Entity Versions within a Lattice](https://github.com/wasmCloud/wasmCloud/issues/363)
3. [Host Metrics](https://github.com/wasmCloud/wasmCloud/issues/664)
4. Distributed WIT Support (RFC forthcoming)
5. Support wasmCloud runtime configuration and secrets (RFC forthcoming)
6. Make WIT and components the default for examples and documentation, including instructions for unknown source languages

There are many smaller tasks that are included as well, such as [namespacing our environment variables](https://github.com/wasmCloud/wasmCloud/issues/1102), that are wonderful issues to pick up if you're looking to contribute to this milestone!

## Diagram

The diagram below shows a loose organization of critical tasks into 3 sections: Stabilizing APIs, WebAssembly standards, and wasmCloud functionality. This roadmap is unordered as each individual task can be completed indepedently, so no rigid order is necessary. The diagram is also not exhaustive, as there are many smaller tasks that are not included. You can view the full-size version [here](/img/2024q1roadmap.png).

![Q1 2024 Roadmap](/img/2024q1roadmap.png)

## Contributing

We welcome all contributors to the wasmCloud project, and we'd love to have help to accomplish our goals. If you're interested in contributing, please see our [Contributing Guide](https://github.com/wasmCloud/wasmCloud/blob/main/CONTRIBUTING.md) for more information, and come join us on [Slack](https://slack.wasmcloud.com) to chat with the team and other community members. We try to mark issues that are good for new contributors with the **good first issue** label, so look out for those for well scoped issues that are a good place to start. We also host [weekly community meetings](https://calendar.google.com/calendar/u/0/embed?src=c_6cm5hud8evuns4pe5ggu3h9qrs@group.calendar.google.com) that are open to all, where we can discuss aspects of the roadmap.
