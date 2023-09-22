---
slug: wasmcloud-0.78.0-componentized-rust
title: "The wasmCloud 0.78.0 Release"
image: "/img/wasmcloud-0.78.0.png"
date: 2023-09-25T9:00:00-04:00
author: "Brooks Townsend"
author_profile: "https://linkedin.com/in/brooks-townsend"
description: "The 0.78.0 release of wasmCloud comes with WebAssembly component support and a completely rewritten, backwards compatible Rust core."
categories: ["webassembly", "wasmcloud", "rust", "standards"]
draft: false
---

![wasmcloud-logo-made-of-rust-crabs](/img/wasmcloud-0.78.0.png)

# Introducing wasmCloud 0.78.0

We're a big fan of bumping minor versions here at wasmCloud. When we released our first version of the Elixir/OTP host, we bumped from 0.18.0 to 0.50.0 just to make it extra clear that this was a big change. Today, we're making a similar bump to 0.78.0, and this blog post will explain why.

<!--truncate-->

## Rust-based, Optimized for WebAssembly Standards

The 0.78.0 release of wasmCloud comes with WebAssembly component support and a completely rewritten, backwards compatible Rust core. We set the requirement that this Rust host would be completely backwards compatible as a testament to our confidence in our APIs, and built it from the ground-up; starting from `wasmtime::Engine::new` to have full **WASI-Preview-2** component support.

To address the 🐘 in the room, yes we went from a Rust host, to an Elixir host, and back to a Rust host. You can see our recent [ADR-0013](https://github.com/wasmCloud/wasmCloud/blob/main/adr/0013-transition-feature-focus-to-rust.md) that solidified this decision, and our many reasons to do so in [this issue RFC #324](https://github.com/wasmCloud/wasmCloud/issues/324). TL;DR:

:::info

Supervisors and supervision trees and OTP processes and the entire stack are absolutely what we would pick if we were building a single, monolithic, real-time application that was being deployed to a target environment, and not being installed by consumers/customers.

But we're not building that. We're building a runtime that needs to be brain-dead simple to install. It needs to be small, fast, portable, type safe, memory safe, and everyone on our team needs to be able to be productive in it. We've learned a lot about Rust and how to build serious applications in Rust since the early days of wasmCloud.

:::

## Why 0.78.0?

You see, if you break down **Rust** into its individual alphabetical letters where A=1, B=2, etc, you can derive the following expression:
$$R = 18, U = 21, S = 19, T = 20; 18 + 21 + 19 + 20 = 78$$

Therefore, our first Rust host release is 0.78.0. This is tongue-in-cheek and we love it.

## wasmCloud v1.0.0

0.78.0 is our latest step towards calling wasmCloud a stable, production-ready project. At a high level, we're looking forward to stabilize wasmCloud on top of:

1. **WASI-Preview-2** and building all wasmCloud applications using WebAssembly components. This includes the requirement that you can bring a WebAssembly component written _without_ wasmCloud SDKs and have it work out-of-the-box. This enables us to add language support to wasmCloud without any major breaking changes to the host itself.
2. **wasi-cloud** core interface initial release and stabilization.
3. Our control interface API for managing resources running on the host should have a stable NATS API.
4. Our RPC framework, including the use of NATS RPC, [msgpack](https://msgpack.org/index.html) encoding over the wire, and the verification of invocation signers and capability claims.
5. The terminology around actors, links, capabilities, applications, scale, etc.

This is an incomplete list of what we plan to commit to for a v1.0.0 release, but I wanted to specifically call out what we're proving out with the community and plan to stabilize. wasmCloud itself is already used in production at a variety of organizations and we're proud of how we're delivering on our goals as a project, though there will be breaking changes between now and a v1.0.0.

## What We're Excited About

We've been leaning in heavily into the [wasmCloud application deployment manager (wadm)](https://github.com/wasmcloud/wadm) project lately as the de facto way to deploy wasmCloud apps. The ability to define a declarative manifest that includes all of your wasmCloud actors, providers and links carries over what many developers enjoy about Kubernetes Deployments. Recently, we added the [daemonscaler](https://github.com/wasmCloud/wadm/releases/tag/v0.6.0) which extends the same idea as Kubernetes DaemonSets, letting you deploy applications across any number of eligible distributed hosts. wasmCloud's role as a Wasm orchestrator really shines with these declarative applications.

Additionally, we've been working hard on our local development story with utilities like [wash dev](https://wasmcloud.com/docs/fundamentals/actors/create-actor/update#wash-dev) which supports hot reloading actors as you write code, `wash spy` for watching all invocations that go to and from an individual actor, and `wash ui` for launching a wasmCloud dashboard from anywhere that you can establish a NATS websocket connection to your lattice. Some of these features are still marked as `--experimental` in `wash` as we iron out the ideal developer experience, and they are available for you to [try](https://wasmcloud.com/docs/installation)!

## Join the Community!

If you're evaluating or using wasmCloud today, please come join us in our [Community Slack](https://slack.wasmcloud.com/) to take part in the conversation, or join our community meetings [every Wednesday at 1pm](https://calendar.google.com/calendar/u/0/embed?src=c_6cm5hud8evuns4pe5ggu3h9qrs@group.calendar.google.com). This release is a milestone for wasmCloud and is infinitely better thanks to our wonderful community, and we look forward to using all your feedback into the stabilization effort.
