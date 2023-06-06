---
title: 2023-05-31 Community Meeting
authors: [brooks]
tags: [community, meeting]
description: Agenda, notes, and recording for the 2023-05-31 community meeting
---

import ReactPlayer from 'react-player/youtube';

### Agenda

- Update on Wadm from Taylor
- [RFC: Defining Interfaces Using Wit](https://github.com/wasmCloud/wasmCloud/issues/336) from Kevin
- What's happening in the wider Wasm community?
  - Component model update from Bailey

<!--truncate-->

### Meeting Notes

- **Update on Wash Commands - Victor**
  - Victor shared some of the work he’s been doing on the Wash Command Structure. Take a look at the RFC for the details.
  - To summarize, wash is what we use to build and sign actors and to interact with wasmCloud locally.
  - We wanted to streamline the swathe of commands that have been added over time. We also want to introspect the cluster.
  - We will move sub-commands out of control and replace them with ergonomic top level commands.
  - We spend a lot of time checking hosts, linkdefs and that the right things are configured. Streamlining commands will make Day 1 and 2 ops loads easier.
  - We believe that making this wholesale change now will save a lot of heartache later - we want to get it right as quickly as possible.
  - The RFC remains open and so please do contribute, particularly if you have suggestions around what the wash structure should look like.
  - For example, we’d love to know what the biggest pain points are - what commands do you run that often fail?
  - Thank you all for your contributions so far.
- **Update on Wadm - Taylor**
  - Release a quick bug fix to wash using cargo install - v0.17.4 is almost out.
  - Wadm - one last feature to work on and Wadm is ready to go.
  - Demo shows Wadm working for realsies - check out the recording.
- **Overhaul lattice link config RFC - Kevin**
  - There are a number of ways that the linkdefs that are stored in the KV bucket do not match what the lattice thinks are there.
  - There may be a mismatch between the capability provider memory and KV bucket, or two different hosts may have 2 diff opinions of what linkdefs are, and these can be completely different again in the KV bucket.
  - Take a look at the RFC which details where many of these fails occur. We have a 3 pronged attack in mind to overcome:
  - **Invert Config Source** instead of pushing linkdefs to capability providers and hoping they deal with it. In this case, the provider then becomes responsible for pulling config. The provider can pull when it starts up and when a link is established and it can pull it before implementation.
  - **Link ping** - capability providers will be required to respond to a ping on a particular linkdef. This is a ‘scatter and gather’ operation - collecting ping responses from capability providers. In any wasmCloud lattice I may see a list of linkdefs but have no idea whether they are live. With Linkping, we can obtain a list of all the link statuses and make inferences based on the providers that don’t apply.
  - **Link purging.** The idea here is to tell a capability provider to purge what it has for each link. Capability providers can then dump all client resources then put that link in an error state if it sees fit.
  - The risks are that we need to make changes to capability providers but the proposition is that it will be worth the breaking changes.

### Recording

<ReactPlayer url='https://youtu.be/Mb8WCerH_PI' controls />
