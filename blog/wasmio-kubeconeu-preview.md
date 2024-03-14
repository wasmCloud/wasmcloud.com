---
title: WASM I/O and KubeCon + CloudNativeCon Europe 2024, What to Expect!
image: '/img/wasmio-kubeconeu-post-header.jpg'
date: 2024-03-14T09:00:00+05:00
author: 'Liam Randall'
description: All roads lead to Europe; find out what we have planned at WASM I/O and KubeCon EU!
tags: ['Cosmonic', 'wasmCloud', 'Cloud Native', 'WebAssembly', 'Wasm']
draft: false
---

![wasmio-kubecon-header](/img/wasmio-kubeconeu-post-header.jpg)

We’re excited to see our friends again as we embark on a whistle-stop tour of two of our favorite European events (and cities) in the 2024 conference calendar: WASM I/O, Barcelona and KubeCon + CloudNativeCon Europe 2024, Paris. With the release of WASI 0.2 and the WebAssembly component model, we’re taking wasmCloud 1.0 on tour—introducing it to cloud native developers, and platform engineers, as the best place to bring components to life in production environments.

<!--truncate-->

## WASM I/O, Barcelona, 14-15 March

First stop, beautiful Barcelona for [WASM I/O](https://2024.wasmio.tech/). This 2-day event has become a firm favorite of ours. It’s a place where we can get together with other WebAssembly community members, and industry leaders, to hear what’s new and share ideas. This event is essential for technicians keen to understand the practicalities of running Wasm in production, alongside existing architecture.

[The schedule is live!](https://2024.wasmio.tech/sessions/) The event kicks off this Thursday 14th March. Our sessions…

### Keynote: [Mind the Gap Between the Wasm Future and the Present](https://2024.wasmio.tech/sessions/mind-the-gap-between-the-wasm-future-and-the-present/), Taylor Thomas, Cosmonic’s Director of Engineering

#### 14:40 - 15:10 CET, Thursday 14th March

On the first day of WASM I/O, our Director of Engineering, Taylor Thomas, will take a closer look at what it’s like to run Wasm in production, and the ways engineers can integrate Wasm with Kubernetes. Without a doubt, this is one of the most commonly asked questions our customers ask. This should be useful for those practitioners looking for ways to work with Wasm in their own stack.

### Panel: [Wasm Warriors: Conquering Real-World Problems in Production](https://2024.wasmio.tech/sessions/wasm-warriors-conquering-real-world-problems-in-production-panel/)

#### 14:10 - 14.40 CET, Friday 15th March

On Friday, Cosmonic CTO, WASI Co-Chair & Bytecode Alliance TSC Director, Bailey Hayes, will join a panel of experts to discuss the role of components in changing cloud native computing for the better. With Nigel Poulton hosting, Fastly’s Daniel Caballero; F5 nginx's Oscar Spencer; Shopify’s Saúl Cabrera; and Bailey will discuss the practical challenges of running Wasm in the real world. This is a stellar line-up and not one to be missed if you’re in Barcelona.

Session recordings will be made available in the coming days, after the show.

## KubeCon EU, Paris, 19-22 March

Then, it’s off to Paris for KubeCon + CloudNativeCon Europe. What’s different this year is the growing level of interest in Wasm coming from the wider enterprise technology ecosystem. Our team will be spreading the good Wasm word at several of the co-located events—Wasm Day (of course); BackstageCon; ArgoCon; Observability Day—demonstrating how wasmCloud integrates with favorite tools and platforms. We also have an exciting workshop planned with Second State’s Michael Yuan; a CNCF Project Lightning Talk from Senior Engineer, Brooks Townsend; _and_ our Infrastructure Director, Dan Norris, will give a talk at GitHub booth D3, Wednesday 20th.

### [Cloud Native Wasm Day](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/co-located-events/cloud-native-wasm-day/): Tuesday, 19th March

Wasm Day is always a fantastic event and this year’s [agenda](https://colocatedeventseu2024.sched.com/overview/type/Cloud+Native+Wasm+Day) is looking juicy. What’s particularly exciting is how many of the sessions will cover the use of wasmCloud is proliferating in industry. We’ll hear from more users than ever, working with with wasmCloud in production.

### Keynote: [Components, WebAssembly’s Docker’s Moment](https://sched.co/1ar9l), Bailey Hayes, Cosmonic

#### 13:35 - 13:55 CET, [Pavilion 7 | Level 7.3 | Room E05 - E06](https://colocatedeventseu2024.sched.com/venue/Pavilion+7+%7C+Level+7.3+%7C+Room+E05+-+E06)

The alignment of Docker as a common, cloud-native runtime dramatically simplified container management and deployment. It drove the widespread adoption and evolution of cloud-native technologies by providing a standardized, efficient, and scalable method to build, share, and run applications across various computing environments. In the same way, WASI 0.2 establishes a standardized foundation for secure, portable, and interoperable software components. In this talk Bailey will discuss the impact WASI 0.2 and the WebAssembly Component Model and how it is poised to transform Cloud Native.

### Keynote: [Choosing Customizability and Distributing Dependencies with Wasm Components](https://sched.co/1YFhJ), Taylor Thomas, Cosmonic

#### 13:55 - 14:20 CET, [Pavilion 7 | Level 7.3 | Room E05 - E06](https://colocatedeventseu2024.sched.com/venue/Pavilion+7+%7C+Level+7.3+%7C+Room+E05+-+E06)

wasmCloud, a CNCF application platform, leverages the component model to run your code distributed anywhere, no matter what or where your dependencies are. In this talk, Taylor will show how a Wasm component can run in two different systems and how easy it is to add custom interfaces—all using open source tooling and projects like `wasi-virt` and W3C standardized interfaces. Then we will demonstrate how you can add custom interfaces without any changes to your runtime while also being able to run it anywhere.

### User Talk: [Edge Evolution: Orange's Edge Strategy with WebAssembly & CNCF wasmCloud](https://sched.co/1YFiY), Yann Cardon, Orange

#### 15:15 - 15:40 CET, [Pavilion 7 | Level 7.3 | Room E05 - E06](https://colocatedeventseu2024.sched.com/venue/Pavilion+7+%7C+Level+7.3+%7C+Room+E05+-+E06)

International telecommunications company, Orange, is facing the challenge of managing data centers and extending robust services to their 184 Points of Presence across 31 countries. In this talk, the audience will delve into Orange's journey in adopting WebAssembly with CNCF wasmCloud, a path that significantly enhance their capability to scale applications to the edge and beyond. This session will provide a deep dive into Orange's innovative strategies to define their edge strategy, including the pivotal role of WebAssembly in enhancing the efficiency, security, and scalability of their telecommunications infrastructure.

### User Talk: [WebAssembly on the Factory Floor: Efficient and Secure Processing of High Velocity Machine Data](https://sched.co/1YFj2), Jochen Rau & Tyler Schoppe - MachineMetrics, LLC

#### 15:15 - 16:20 CET, [Pavilion 7 | Level 7.3 | Room E05 - E06](https://colocatedeventseu2024.sched.com/venue/Pavilion+7+%7C+Level+7.3+%7C+Room+E05+-+E06)

MachineMetrics is transforming the way data is processed in industrial settings through the instrumentation of edge devices with NATS/JetStream and wasmCloud. In this talk, Jochen and Tyler will take a technical look at WebAssembly and discuss why it is advantageous compared to traditional approaches in IoT environments. We will cover our custom approach to downsampling high-frequency machine data, utilizing the Largest-Triangle-Three-Buckets (LTTB) algorithm adapted for real-time data streams, to provide proactive maintenance telemetry across edge and cloud platforms.

## [Wider Co-Located Events](https://colocatedeventseu2024.sched.com/): Tuesday, 19th March

Attention is turning towards how WebAssembly can integrate with popular platforms and toolsets and so, our team is delighted to be speaking at ArgoCon, BackstageCon and Observability Day, this year.

### [ArgoCon: GitOps for the Edge: Delivering WebAssembly with Argo CD](https://sched.co/1YFfx), Dan Norris & Joonas Bergius, Cosmonic

#### 11:40 - 12:05 CET; [Pavilion 7 | Level 7.3 | Room N04](https://colocatedeventseu2024.sched.com/venue/Pavilion+7+%7C+Level+7.3+%7C+Room+N04)

We all know that Argo CD is one of the best ways to deploy applications on Kubernetes using GitOps, but did you know you can also use it to deploy more than just containerized applications on your clusters? In this talk, Dan and Joonas will share an introduction to wasmCloud, a CNCF project for building and delivering cloud-native applications using WebAssembly. Using this knowledge, they’ll show you how you can Argo CD to deploy wasmCloud applications GitOps workflows you already know and love.

### [Observability Day: Observability at the Edge: Instrumenting WebAssembly with OpenTelemetry](http://colocatedeventseu2024.sched.com/event/1YFiks://colocatedeventseu2024.sched.com/event/1YFik), Dan Norris & Joonas Bergius, Cosmonic

#### 15:15 - 15:40 CET, [Pavilion 7 | Level 7.3 | Room N01 - N02](https://colocatedeventseu2024.sched.com/venue/Pavilion+7+%7C+Level+7.3+%7C+Room+N01+-+N02)

Dan and Joonas will discuss how we add support for end-to-end observability in wasmCloud, the popular CNCF project for building and delivering cloud-native applications using WebAssembly. They will discuss what we needed to do in order to support the three pillars of observability by adding tracing, logging and metrics support using OpenTelemetry. Along the way they will address some of the limitations of the approach and some open questions regarding observability in the WebAssembly space.

### [BackstageCon: Assembling a Bigger Band: Backstage Plugins in Any Language with WebAssembly](https://colocatedeventseu2024.sched.com/event/1YFiw), Victor Adossi, Cosmonic

#### 15:50 - 16:15 CET, [Pavilion 7 | Level 7.1 | Room C](https://colocatedeventseu2024.sched.com/venue/Pavilion+7+%7C+Level+7.1+%7C+Room+C)

Backstage gets better, faster, and benefits more people when plugins can be written in any language. WebAssembly is the next frontier for portable computing, which means more Backstage users than ever before can write and contribute plugins to the Backstage ecosystem—more giants' shoulders to stand on. In this talk, a framework for producing Backstage plugins in any language supported by WebAssembly will be introduced.

## [KubeCon + CloudNativeCon EU](https://events.linuxfoundation.org/kubecon-cloudnativecon-europe/)

### CNCF Project Lightning Talk: [wasmCloud: Declarative WebAssembly Orchestration for Cloud Native Applications](https://sched.co/1aQhr), Brooks Townsend, Cosmonic

#### 16.00 - 16.07 CET, Tuesday 19th March, [Pavilion 7 | Level 7.1 | Room D](https://kccnceu2024.sched.com/venue/Pavilion+7+%7C+Level+7.1+%7C+Room+D?iframe=yes&w=100%&sidebar=yes&bg=no)

As wasmCloud approaches the 1.0 milestone, Cosmonic’s Senior Engineer, Brooks Townsend will demonstrate how the project enables users to build and orchestrate WebAssembly (Wasm) applications across distributed infrastructure. Learn how wasmCloud integrates the latest developments in the WebAssembly System Interface (WASI) to help users create and deploy applications “building block” style—connecting portable, interoperable Wasm components so they can focus on business logic. Brooks will cover wasmCloud’s component support, distributed networking, declarative orchestration, OpenTelemetry observability, the project roadmap, and more.

[Full list of lightning talks](https://kccnceu2024.sched.com/overview/type/%E2%9A%A1+Lightning+Talks)

### GitHub Live Presentation: Building the distributed applications of the future with wasmCloud, Dan Norris, Cosmonic

#### 16:00 - 16:30 CET, Wednesday 20th March, GitHub Booth D3

This year, at the GitHub booth (D3), the team is inviting open source community leaders from across the cloud native ecosystem to share their stories. Our Dan Norris’ 10-minute talk, Building the distributed applications of the future with wasmCloud, will look at how the WebAssembly component model is redefining the way we build cloud native applications forever.

### KubeCon Workshop: [Cloud Native WebAssembly and How to Use It](https://sched.co/1YeNZ), Brooks Townsend, Cosmonic & Michael Yuan, Second State

#### 16:30 - 18:00 CET, Wednesday 20th March, [Pavilion 7 | Level 7.3 | N01-02](https://kccnceu2024.sched.com/venue/Pavilion+7+%7C+Level+7.3+%7C+N01-02)

How does Wasm work? How does Wasm fit into an existing cloud native stack? What is a WASI, or a Preview 2, or the Component Model, or a WIT? This tutorial is a deep dive into cloud native WebAssembly. It starts with a brief overview of the binary format itself, moving on the standards that power Wasm applications, and finishing with running the exact same binary in two different CNCF application runtimes: wasmCloud and WasmEdge. This is a must-see session!

All KubeCon talks are recorded and made available in the week after the event. We’ll provide our usual summary plus live links! See you in Europe!
