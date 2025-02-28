---
title: "Introduction to Wadm"
date: 2020-01-19T00:00:00+00:00
icon: "ti-map" # themify icon pack : https://themify.me/themify-icons
description: "The wasmCloud Application Deployment Manager (wadm)"
type: "docs"
sidebar_position: 0
---

<head>
  <meta name="robots" content="noindex" />
</head>

![wadm logo](https://raw.githubusercontent.com/wasmCloud/wadm/main/wadm.png)

If you've been reading the tutorials or going through the reference guide in order, then by now you should be pretty familiar with what we call _imperative deployment_. This involves using the `wash` tool (or invoking the control interface directly) to send imperatives or _commands_ to a lattice. These commands are things like telling a host to start or stop an actor, start or stop a provider, etc.

Imperative deployments are good for debugging and experimentation, but when it comes time to deploy an application to production, you're usually managing many actors and providers. You also need to manage the configuration information for the bindings between actors and providers. If you want to scale your application out to handle more load or you want to relocate actors or providers to optimize for certain conditions, just using the wasmCloud host and `wash` means you're doing that all by hand.

:::info[For the Kubernetes Developer]
You can think of a wadm application like a Kubernetes Deployment: define your application components and wadm will ensure that your application reaches desired state based on your manifest.
:::

## Introduction

The wasmCloud Application Deployment Manager (`wadm`) is a tool for managing _declarative deployments_. Where imperative deployments are built by an ordered sequence of commands, a declarative deployment sits above that abstraction. With a declarative deployment, the developer defines the components, configuration, and scaling properties of their application and wadm is responsible for issuing the low-level commands responsible for making that declaration a reality.
