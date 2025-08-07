---
title: 'wasmCloud Application Deployment Manager (wadm)'
date: 2020-01-19T00:00:00+00:00
icon: 'ti-map' # themify icon pack : https://themify.me/themify-icons
description: 'The wasmCloud Application Deployment Manager (wadm)'
type: 'docs'
sidebar_position: 0
---

:::warning[Planned changes to scheduling]
The [**wasmCloud Q3 2025 Roadmap**](https://github.com/orgs/wasmCloud/projects/7) sets out plans for an overhaul to scheduling in the next major release of wasmCloud. The new scheduling API will not use NATS to communicate between components by default, but will still support distributed communication via NATS. For more information, see the [Roadmap](https://github.com/orgs/wasmCloud/projects/7) and [Issue #4640: “Intentional distributed networking.”](https://github.com/wasmCloud/wasmCloud/issues/4640)
:::

## Overview

The **wasmCloud Application Deployment Manager (wadm)** manages declarative [application](/docs/concepts/applications) deployments, reconciling the current state of an application with the desired state.

In a declarative deployment pattern, developers define the components, configuration, and scaling properties of their applications using static configuration files that can be versioned, shared, edited, and otherwise used as a source of truth. In wasmCloud, those application manifests conform to the [**Open Application Model (OAM)**](https://oam.dev/) and may be written in YAML or JSON. Once a deployment is declared, wadm issues the low-level commands responsible for making that declaration a reality.

:::info[For the Kubernetes developer]
Application manifests should be very familiar to Kubernetes developers. Moreover, you can think of a wasmCloud application deployment as roughly analogous to a Kubernetes deployment: once you define your application components in a manifest, wadm will ensure that your application reaches desired state based on that manifest.

If you're interested in deploying WebAssembly applications on Kubernetes, check out [our Kubernetes operator](/docs/kubernetes) that makes it easy to deploy and leverage declarative wadm manifests.
:::

## Application deployment lifecycle

The diagram below illustrates the lifecycle of an application once deployed to wadm:

![Application deployment lifecycle](/docs/images/application-lifecycle.jpg)

- The user deploys the application manifest (defined in a `wadm.yaml` file) to wadm via wash according the wadm API.
- wadm validates the manifest and exports it (as a versioned representation of the application called a **model**) to a NATS key-value bucket that is external to wadm.
- Meanwhile, the deployment is passed to the wadm **scaler manager**, which creates a scaler for the application. The scaler begins a **reconciliation loop** (represented in the cutout below).

![Reconciliation loop](/docs/images/reconciliation-loop.jpg)

- Once a scaler is created, it compares the current state to the desired state and issues a status accordingly: **Deployed**, **Reconciling**, or **Failed**.
  - `Deployed` indicates that the current state matches the desired state.
  - `Reconciling` indicates that the current state does not match the desired state, but the scaler can issue commands to reach the desired state.
  - `Failed` indicates that the current state does not match the desired state, and the scaler cannot issue commands to reach the desired state.
- The scaler publishes commands to a NATS command stream as needed.
- From here, the scaler will wait for events that might change the current state.

## Keep reading

The following pages provide more detail on various aspects of application deployment with wasmCloud and wadm:

- [Defining Applications](/docs/ecosystem/wadm/model) - How to describe an application in a deployment manifest.
- [Deploying Applications](/docs/ecosystem/wadm/usage) - Approaches to deploying applications.
- [Using the wadm API](/docs/ecosystem/wadm/api) - Overview of the high-level functionality exposed by wadm
- [Application Status](/docs/ecosystem/wadm/status) - Further details on application status.
- [Migrating from 0.82](/docs/ecosystem/wadm/migrating) - Guidance for users adapting v0.82 manifests for use with the most current version.
