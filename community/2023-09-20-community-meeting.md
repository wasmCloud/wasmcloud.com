---
title: 2023-09-20 Community Meeting
authors: [brooks]
tags: [community, meeting]
description: Agenda, notes, and recording for the 2023-09-20 community meeting
---

import ReactPlayer from 'react-player/youtube';

### Agenda

- DEMO: Live demo from DTW23, WebAssembly Canvas Catalyst Vance Demo
- DEMO: Building NATS microservices in wasmCloud
- DISCUSSION: wasmCloud metrics
- DISCUSSION: wasmCloud 0.78.0 official release

<!--truncate-->

### Meeting Notes

**DEMO: 5G, CCS and ODA use case running on wasmCloud**

- Vance Shipley joins us live from TMForum's DTW23 event in Copenhagen.
- This event has a distinct telecoms focus and he’s seen great interest from the telco providers in working with WebAssembly.
- He demos an interesting service optimization use case: [5G, CCS and ODA use case running on wasmCloud](https://www.tmforum.org/catalysts/projects/C23.0.601) — this has, reportedly, been an eye-opener.
- Nokia, Ericsson and all the major telecoms providers have massive infrastructures and so it's been interesting to explain how WebAssembly allows the kind of scale telcos/ISPs are used to.
- How do you build a large system like this? Once the team implemented everything in wasmCloud putting everything together becomes interesting.
- The team implemented contracts in smithy + SDKs to create fresh interfaces which can replace the usual TMForum standard interfaces.

**DEMO: Building NATS microservices in wasmCloud - Kevin**

- There hasn’t been functionality for service discovery in NATS until now!
- https://github.com/nats-io/nats-architecture-and-design/blob/main/adr/ADR-32.md - check whether correct.
- In the last week a few NATS clients have been rolling out new functionality that allows us to expose the code that is following the request response pattern. Essentially, you can now use NATS to discover or recover information — and it’s rolling out as a free feature to clients.
- Demo: using a local build called Bob; all services have unique IDs. You’ll see it’s possible to add arbitrary metadata to each service you run.
- Each service has 1 or more end points.
- This allows us to discover microservices and obtain a catalog on whats’s running in the infrastructure, or in an account.
- Does not sacrifice any of the good stuff we get from NATS —e.g. location agnostic goodness of NATS remains.
- You can list all the all the services that are within communication within your NATS CLI.
- Doesn’t take much effort to expose wasmCloud actors as services.
- Synadia plans to add an option to the NATS messaging provider (currently manual) — so it magically appears as a NATS service 🙂
- If you’re using any of the major languages you already have the ability to explicitly publish service information.

**DISCUSSION: wasmCloud Metrics**

- Steve filed an issue talking about RPC invocations: RFC: https://github.com/wasmCloud/wasmCloud/issues/637
- RFC: Separating out RPC events onto a diff topic rather than cloud events - refactor to the Rust host, we do not have the wasmbus RPC EVT events being published for every single event: https://github.com/wasmCloud/wasmCloud/issues/664
- Now, you can see the status of all invocations.
- Main point is to be able to create an aggregate metric — all invocations that failed and succeeded over time. We can start to see trends.
- In particular, See whether you’re succeeding over time — % of successful requests etc.
- Similar to service mesh - delivered straight over NATS.
- Implementing Prometheus metrics in wasmCloud:
  - Already have OTEL support for tracing - nice to get that data.
  - Some of the things missing; accuracy. Historical comparison.
  - Rust Host lost some of that introspection.
  - Info on number of actors providers invocations that have a particular provider or actor.
  - Interesting summary stats around specific resource usage: so we can more accurately scale actors up and down.
  - Provider exposing metrics - counter for number of 500s/400s = pretty common = want to be able to do the same thing in wasmCoud.
  - Some work to do to decide how, but this is where we’re leaning.
  - [Observability and metrics RFC](https://github.com/wasmCloud/wasmCloud/issues/664) - please get involved if you have expertise - we’re excited to hear your opinions and experiences.
  - Check out the recording for the full discussion.

**DISCUSSION: wasmCloud 0.78.0**

- We are excited to announce we have cut a fresh version of wasmCloud.
- We’ll have a blog ready in the next day or so with all the details.
- Feature frozen for future stuff.
- We are really happy with where we are after a ton of testing 🙂
- From here we can milestone out in the run up to wamCloud 1.0.0 and becoming a CNCF. incubation project (hopefully soon).
- This release will be out in wash and wadm shortly.
- Check out the recording for the full discussion.

### Recording

<ReactPlayer url='https://www.youtube.com/watch?v=7GR19pgb2u0' controls />
