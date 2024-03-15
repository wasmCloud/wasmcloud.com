---
title: "Introduction to Wadm"
date: 2020-01-19T00:00:00+00:00
icon: "ti-map" # themify icon pack : https://themify.me/themify-icons
description: "The wasmCloud Application Deployment Manager (wadm)"
type: "docs"
sidebar_position: 0
---

![wadm logo](https://raw.githubusercontent.com/wasmCloud/wadm/main/wadm.png)

In wasmCloud, we use the `wash` tool (or invoking the control interface directly) to send commands "imperatively" to a lattice. These commands are things like telling a host to start or stop a component, start or stop a provider, etc.

**Imperative deployment** is useful for debugging and experimentation, but when it comes time to deploy an application to production, you're usually managing many components and providers. You also need to manage the configuration information for the bindings between components and providers. If you want to scale your application out to handle more load or you want to relocate components or providers to optimize for certain conditions, just using the wasmCloud host and `wash` means you're doing that all by hand.

At this stage, you need a way to issue commands **declaratively**, using a static configuration file that can be versioned, shared, edited, and otherwise used as a source of truth.

:::info[For the Kubernetes Developer]
You can think of a wadm deployment as roughly analogous to a Kubernetes deployment: once you define your application components in a declarative manifest, wadm will ensure that your application reaches desired state based on the manifest.
:::

## Introduction

The wasmCloud Application Deployment Manager (`wadm`) is a tool for managing _declarative deployments_. Where imperative deployments are built by an ordered sequence of commands, a declarative deployment sits above that abstraction. With a declarative deployment, the developer defines the components, configuration, and scaling properties of their application and wadm is responsible for issuing the low-level commands responsible for making that declaration a reality.
