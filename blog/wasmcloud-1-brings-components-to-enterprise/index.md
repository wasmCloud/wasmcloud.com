---
title: 'wasmCloud 1.0 Brings the WebAssembly Component Model to Enterprise'
image: '/img/wasmcloud-1.png'
date: 2024-03-19T11:00:00-05:00
author: 'Brooks Townsend'
description: "wasmCloud 1.0 brings WASI 0.2 and the Wasm Component Model to production environments"
categories: ['webassembly', 'wasmcloud', 'Cloud Native', 'CNCF']
draft: false
---

![wasmCloud 1.0](/img/wasmcloud-1.png)

- *Brings WASI 0.2 and components to production environments*
- *Meet wRPC: a protocol for composing components over distributed networks*
- *`wash build` components in Python, Javascript, .NET, C++, and more*

<!--truncate-->

**PARIS (KubeCon+CloudNativeCon, EU), March 19, 2024.** Production-ready and components-first, [wasmCloud 1.0](https://wasmcloud.com/) brings [WASI 0.2](https://github.com/WebAssembly/WASI/blob/main/preview2/README.md) and the WebAssembly (Wasm) Component Model to production environments. With a host of new features, the popular CNCF project is the most open, secure, stable and standards-led ecosystem for deploying and orchestrating distributed Wasm applications in production&mdash;on any device, server or cloud.

Liam Randall, Cosmonic CEO says: “WebAssembly components are the new containers. Companies copy ‘golden templates' thousands of times: legacy application templates, often Java Spring Boot, that include thousands of lines of open source software, and dozens of libraries. Developers own the cost of maintaining these templates on an app-by-app basis. With components in wasmCloud, developers write less code, so they maintain less code. They stop reimplementing common functions over and over again; instead of copying boilerplate code, they copy a list of components, imported at runtime.”

### Vendor-less Application Components

wasmCloud 1.0 realizes the dream of abstracting away vendor and language considerations from software development. Whether written in Python, Go, C++ or any other language, WASI 0.2 components interoperate using standard Wasm Interface Types (WIT). This unties engineers from specific libraries so they can focus on business logic, swapping non-functional requirements in and out at runtime.

**Components by-default: distributed support with wRPC**. wRPC (WIT over Remote Procedure Call) is an ambitious new protocol for interacting with distributed components over networks. wRPC makes distributed computing in wasmCloud feel like composing components over the lattice. wRPC is designed to be protocol agnostic, and wasmCloud provides the first implementation over NATS, bringing the benefits of Wasm to life: **composable, reusable components, linked together like building blocks, dynamically deployed over distributed networks.**

**[`wash build` components in any language](https://wasmcloud.com/blog/bring-your-own-wasm-components)**. wasmCloud already has first-class support for Rust, Python, and TinyGo components, but now supports components of all languages. Custom build commands enable the use of community projects, such as the Bytecode Alliance's open source ComponentizeJS and Joel Dice’s [componentize-py](https://github.com/bytecodealliance/componentize-py) projects to build components from Javascript, Python and more.

**Out-of-the-Box WASI 0.2 Support.** Tuning processes to WASI 0.2 means engineers bring their own components to wasmCloud with standard tooling. Likewise, they can port their Wasm components to any environment where components are supported. wasmCloud 1.0 comes with several standard interfaces&mdash;`wasi:cli` for environment, `wasi:runtime` for configuration and `wasi:http`&mdash;but any 0.2 component will work perfectly in wasmCloud.

**OpenTelemetry (OTEL) Observability**. Observability is crucial in distributed systems so wasmCloud has supported exporting OTEL traces for over a year. 1.0 adds OTEL support for logs and metrics, the other two pillars of observability. Metrics like **component concurrency  gauging** compares specified concurrency levels with deployment targets–scaling accordingly. For timely incident detection, **instrumenting error rates for component invocations allows for hooking into existing alerts with an error threshold**. Thanks to the common OTLP format, metrics, logs and traces will fit right into your existing observability pipeline.

**Seamless Distributed Networking.** wasmCloud’s lattice is a flat topology network that enables application components to communicate exactly the same, whether they are running on a single machine or globally distributed at scale. The lattice, powered by CNCF NATS, **automatically load-balances** requests between application components, **failing over immediately** in the case of an outage. Requests intelligently stay geo-located when a remote resource isn’t necessary, reducing response time.

**Declarative Orchestration with Wadm**. Wadm orchestrates the deployment and management of Wasm applications, **at scale and in any location**. Users define declarative [Open Application Model](https://oam.dev/) manifests for applications and the Wadm reconciliation loop ensures apps run and continue to operate without downtime. When infrastructure is added or removed, Wadm dynamically rebalances applications based on constraints specified in the manifest.

**Secure By-Default**. Having passed the OSTIF/Trail of Bits [security audit](https://ostif.org/wp-content/uploads/2023/10/wasmcloud-audit-ostif-trail-of-bits-final.pdf) with flying colors, new features cement the commitment to security. wasmCloud supports signing components with ed25519 keys, allowing for offline verification of component identity and issuer. Meanwhile, engineers can increase, but never reduce, the level of security of wasmCloud with features like the pluggable policy service.

Final release candidates will be released throughout the March timeframe with the final cut planned for release early April. As they become available, release candidates are available in the [wasmCloud repository](https://github.com/wasmCloud/wasmCloud/releases).

### In Production

Interest in wasmCloud has grown rapidly in the last couple of years. The project has attracted over 2,300 organization stars and more than 80 contributors across the organization’s 50 repositories. [Adobe](https://www.cncf.io/blog/2022/11/17/better-together-a-kubernetes-and-wasm-case-study/) and [BMW](https://www.techtarget.com/searchitoperations/news/252527414/Server-side-WebAssembly-prepares-for-takeoff-in-2023) have been running wasmCloud in production for some time, with [new industry projects](https://www.cncf.io/blog/2024/01/05/bringing-webassembly-to-telecoms-with-cncf-wasmcloud/) emerging all the time. The project is expected to reach incubation status within the CNCF this Spring.

**Visit us at KubeCon + CloudNativeCon Europe 2024:**

**Cosmonic Booth:** K37

**wasmCloud Booth:** Open Source Project Pavilion, Wed 20th, 3 - 9pm (during booth crawl)

[See where we’re talking](https://cosmonic.com/blog/industry/wasmio-kubeconeu2024-preview)
