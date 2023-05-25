---
slug: host-there-and-back-again
title: "The Host; Or There and Back Again"
image: "/img/there-and-back-again.jpg"
date: 2023-05-20T09:00:00+05:00
author: "Kevin Hoffman"
author_profile: "https://twitter.com/KevinHoffman"
description: "Reflecting on the evolution of the wasmCloud runtime host"
draft: false
---

![map - zoom in for easter eggs](/img/there-and-back-again.jpg)

We should always plan to take advantage of the benefits and clarity offered by hindsight, reflection, and learning from what came before. In this post, we take a look back at where we started, where we've been, and take a peek at where we're going.

<!-- truncate -->

Code that came before isn't intrinsically bad. Decisions made before that resulted in change aren't necessarily **_wrong_**, they were made based on the best information available at the time, using the tools and technology at hand. Assumptions can be revisited, resulting in new directions, but don't let revisiting previous assumptions feel like an exercise in blame. We make this mistake often by referring to legacy code as _"brown field"_, as if what came before is somehow barren and fallow, when instead it's what probably pays our bills and keeps the lights on long enough to allow us to innovate on future features and products.

This post is a blameless reflection on our host's journey so far.

## The Journey Begins
The first version of wasmCloud's host runtime predates the name **wasmCloud**. It was a wafer thin Rust application that loaded wasmCloud actors built with WebAssembly and our own proprietary ABI (because there weren't any proposals for robust guest/host communication back then). It didn't have any networking support, and so our nearly 3-year old runtime resembles some of the runtimes currently available today that offer microservice or serverless options in silo'd runtime hosts.

We then added the ability for multiple hosts to coexist within the same logical network (called a `lattice`), which created two code paths for every action the host performed: local or remote.

From here we added more and more functionality, including support for a control interface that allowed hosts to be remotely controlled and the aggregate status of a lattice to be queried. We had adopted a Rust actor framework called Actix, and the ratio of time spent on network plumbing, concurrency, and resiliency to basic features was probably in the neighborhood of **10:1**. Something needed to change or we'd never be able to get around to working on our key features and innovations.

Roughly two years ago we made a choice to try and reverse that effort ratio. Back in June of 2021, we decided to switch from Rust to Elixir, as outlined in this [Architectural Decision Record](https://wasmcloud.github.io/adr/0010-otp.html). Since then, we've had two years to experience Elixir/OTP in real-world, production scenarios. We've gathered evidence, used that ecosystem "in anger", and exposed that codebase to more and more people as our team has grown from the original 2021 creators to the large community we enjoy today.

## The Journey Continues
Today we're revisiting the decision to switch from Rust to Elixir, but why? As I mentioned at the beginning of the post, successful teams constantly revisit the assumptions that led them down their current path.

In our case, the assumptions come down to environment, knowledge, experience, and learning things the hard way. One of the main lessons we learned is that Elixir applications aren't really designed to be run and deployed like "consumer apps", shrink-wrapped and distributed ready to go. Elixir apps are find far more suitable homes on curated server environments. The developer experience of running an Elixir app and the team experience of building, testing, deploying (and lately cross-compiling), is very high-friction.

Even with the help of Dialyzer, the core team encountered many problems stemming from Elixir's dynamic typing. We got better at handling this over time, and more diligent about writing type specifications, but underneath those layers remains a completely untyped language.

We bet a lot on the benefits we would get from [OTP](https://www.erlang.org). OTP has been around for what seems like forever, and for those who've never seen it, it's become intermingled as a core part of Erlang. OTP is by far the single most battle-tested piece of our technology stack. Supervision trees are enormously powerful, as is the entire [GenServer](https://hexdocs.pm/elixir/1.14/GenServer.html) model. If we compare the clean, concise code from well-written `GenServer`s to the kind of code we were writing with Actix back in the days of our original Rust host: it's like night and day. The old code was inscrutable and a nightmare to maintain.

The ability to run `recompile` inside an `iex` REPL as we're coding is a feature worth salivating over, and it saved us tons of time and frustration. [Horde](https://hexdocs.pm/horde/getting_started.html) and Erlang clustering give us so much power, we feel like we should be wielding it from our own private James Bond villain island lair. Supervisors and supervision trees and OTP processes and the entire stack are _without doubt_ what we would choose if we were building a single, monolithic, real-time application deployed to a curated target environment, and not being installed by consumers/customers.

But the reality is we're _not_ building that. We're building a runtime that needs to be brain-dead simple to install. It needs to be small, fast, portable, type-safe, memory safe, consumer-friendly, and everyone on our team needs to be able to be productive in it. We've learned a lot about Rust since the early days and how to build serious applications in Rust, and we genuinely think we can do better this time around.

Given the current circumstances, the current makeup of the team, the current interest of the community around Rust, portable applications, embedded devices and development, edge computing, and-if we're honest-availability of modern, actively maintained open source libraries... Rust seems like the right choice _now_.

This doesn't mean that Elixir/OTP was the wrong choice 2 years ago. It means that we've applied two years of learning and critical thinking to our decisions. This is why we've created [this RFC](https://github.com/wasmCloud/wasmCloud/issues/324), where we'd love to hear from the community about this decision and the road that led us here.

## The Bright Future
Everything that we've learned up to this point, including the things we've learned the hard way, has paved the road for what lies ahead. We couldn't be more excited about the tools, technologies, and frameworks available to use today to build the future of distributed computing.
