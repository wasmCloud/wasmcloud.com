---
title: "App Deployments (wadm)"
date: 2018-12-29T11:02:05+06:00
weight: 6
draft: false
---

<img align="right" src="/images/wadm.png" alt="wadm logo" style="width: 200px" />


If you've been reading the tutorials or going through the reference guide in order, then by now you should be pretty familiar with what we call _imperative deployment_. This involves using the `wash` tool (or invoking the control interface directly) to send imperatives or _commands_ to a lattice. These commands are things like telling a host to start or stop an actor, start or stop a provider, etc. For a full list of these commands, check out the [lattice control interface](../lattice-protocols/control-interface) protocol.

Imperative deployments are good for debugging and experimentation, but when it comes time to deploy an application to production, you're usually managing many actors and providers (remember wasmCloud actors are smaller than microservices, so you could have many more of them than you might have docker images or `jar` files, etc). You also need to manage the configuration (linkdef) information for the bindings between actors and providers. If you want to scale your application out to handle more load or you want to relocate actors or providers to optimize for certain conditions, just using the wasmCloud host and `wash` means you're doing that all by hand.

## Introduction
The wasmCloud Application Deployment Manager (`wadm`) is a tool for managing _declarative deployments_. Where imperative deployments are built by an ordered sequence of commands, a declarative deployment sits above that abstraction. With a declarative deployment, the developer defines the components, configuration, and scaling properties of their application and wadm is responsible for issuing the low-level commands responsible for making that declaration a reality.
