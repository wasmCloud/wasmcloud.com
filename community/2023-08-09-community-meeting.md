---
title: 2023-08-09 Community Meeting
authors: [brooks]
tags: [community, meeting]
description: Agenda, notes, and recording for the 2023-08-09 community meeting
---

import ReactPlayer from 'react-player/youtube';

### Agenda

- DEMO: wadm 0.5 feature showcase
- DISCUSSION: Roadmap update on Rust host and Witify efforts

### Meeting Notes

- **Wadm 0.5 Feature Showcase**
  - Wadm repository - view in [issues page](https://github.com/wasmCloud/wadm/milestones) - current milestones: v0.5.0, v0.6.0 issue milestone.
  - v0.5.0 will be the next release. This will come with a host of new features and fixes.
  - None of these developments are tagged good first issues but we think it would be good to open things out to contributions.
  - Priorities for v0.5.0
    - [Version upgrades for actors and providers.](https://github.com/wasmCloud/wadm/issues/143)
    - [Terminating old resources](https://github.com/wasmCloud/wadm/milestone/1#:~:text=%5BBUG%5D%20Newly%20deployed%20applications%20do%20not%20terminate%20old%20resources).
    - [Validation around manifests](https://github.com/wasmCloud/wadm/issues/122).
- **DEMO**
  - Demo setup: `wash up -d --disable-wadm` and then running wadm from the manifest upgrade branch.
  - [Wadm](https://github.com/wasmCloud/wadm) is responsible for managing applications in declarative states.
  - In our pet clinic app example you'll see a [wadm.yaml](https://github.com/wasmCloud/examples/blob/main/petclinic/wadm.yaml) - uses the OAM format - using the same standard.
  - In this example, we see 5 different actors laid out as components inc. image ref. and assembled spread scaler trait (allowing you to spread out to more locations - more to come on that!).
  - New feature: Status Updates - allows you to see whether your app fully-deployed, if it's having issues finding available hosts, etc.
  - New feature and fix: manifest upgrades - deploy a new version of an application that has changes. You can update the version in the manifest - and run several replicas of the same instance.
  - In this example, we see the manifest update across 5 separate actors.
  - See the recording for the full demo and discussion.
- **DISCUSSION: Roadmap update on Rust host and Witify efforts**
  - Following the publication of the [wasmCloud Roadmap](https://github.com/orgs/wasmCloud/projects/7), we're keen to make sure you're updated on how we're integrating WASI Standards and priming wasmCloud for the Component Model.
  - Community members have been working on the Rust host - most of the core functionality will be in within the next few weeks.
  - WITify - the effort to change all interfaces to WIT and expressing our logics in actors and providers, based on WIT. We have made great progress here -- Victor has been been scaffolding it out, getting codegen working for providers.
  - Wasifills, multiplexer experiments. Paused whilst some changes within the Wasm community have been ratified.
  - If anyone has any suggestions around the roadmap and issues milestones, feel free to suggest.
- **Wasm Ecosystem**
  - Take a look at Golang site [Go 0.21](https://go.dev/blog/go1.21), now released with an experimental port for WASI - really exciting development in the Go space.
  - The Bytecode Alliance already organized a [Go subgroup](https://github.com/bytecodealliance/SIG-Guest-Languages/pull/5) in its SIG Guest Languages.
- **Events**
  - WasmCon: [https://events.linuxfoundation.org/wasmcon/](https://events.linuxfoundation.org/wasmcon/)
  - BA Componentize the World Hackathon: [https://bytecodealliance.org/articles/announcing-componentize-the-world](https://bytecodealliance.org/articles/announcing-componentize-the-world)

### Recording

<ReactPlayer url='https://www.youtube.com/watch?v=JQRc8beCrKA' controls />
