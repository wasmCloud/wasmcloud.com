---
title: 2022-11-09 Community Meeting
authors: [brooks]
tags: [community, meeting]
---

<!-- Copy this template, rename to YYYY-MM-DD-community-meeting.md and fill in from there-->

### Agenda

- Demonstrate new docusaurus homepage with blogs and documentation
- Demonstrate `wash down`, cleanup counterpart to `wash up`
- Discuss agenda and community meeting notes
- Revisiting project-template GitHub Actions for monorepo development with @Stephen Andary

<!--truncate-->

### Meeting Notes

- Warm welcome to Stephen Andary, who made the leap to build his application on wasmCloud after considering some things like Kubernetes.

- Short demo of the updated homepage and documentation site for wasmCloud, built on Docusaurus. Docusaurus supports internationalization, nice styles by default, document versioning, and more, hence the choice for documentation.

- Short demo of `wash down` shutting down a wasmCloud host and NATS servers that are launched with wash up. This won’t affect externally running NATS servers (e.g. via systemd services.)

  - Small question around the ordering: The ordering of wasmcloud shutdown then NATS is important so that the wasmCloud host has time to send any remaining messages, tell capability providers to shutdown, and then send the final “host_stopped” event so that any other listening entities can react to the host stopping.

- As we consider project templates, one thing that we noticed is that our actions in the project templates work great for single repositories but not for monorepos. We briefly explored some alternatives and methods in the call, ultimately landing on some things we can iterate on and try to manage actor secrets.

- Makefiles for projects will soon be deprecated, and then in a later minor version of wash (at least `0.15.0`+) they will be removed in favor of `wash build`. This is nice as these Makefiles already only sort-of work for Windows workflows

- Brought up the [Kelsey Hightower & Scott Johnston fireside chat on WebAssembly](https://cosmonic.com/blog/webassembly-with-kelsey-hightower-and-docker-ceo-scott-johnston-kubecon-na-2022)

### Recording

Recording is being uploaded to YouTube and will be displayed promptly
