---
title: "OCI Registries and the Lattice"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 7
draft: false
---

When using the control interface (a set of services and functionality exposed via NATS), you can tell "the lattice" to start and stop actors and capability providers. One of the ways that you can identify actors and capability providers is with an _OCI Reference URL_.

When we refer to **OCI** throughout our documentation, we are likely talking about a specific subset of the _Open Container Initiative_, the [OCI distribution](https://github.com/opencontainers/distribution-spec) specification.

The use of an OCI registry as a source for signed actors and capability provider archives means that your running _lattice_ deployment in production can either access a public registry, or it can access one that you have securely deployed within your organization.

OCI registries, especially those deployed privately within an organization, can be made part of a deployment pipeline such that built, signed, and ready-to-use artifacts can be pushed to the registry and then retrieved from that registry at runtime in response to control interface requests or invocations of various Host functions.

The `wash` CLI has command options for pushing to, pulling from, and inspecting actors and providers in an OCI registry.
