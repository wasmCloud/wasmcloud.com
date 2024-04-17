---
title: 'wasmCloud-operator: Cosmonic Open Sources Controller to Bring Community Wasm to K8s'
image: '/img/wasmcloud-operator-kubernetes.jpg'
date: 2024-04-16T11:00:00-05:00
author: 'Brooks Townsend'
description: 'OSSNA: Cosmonic releases wasmCloud-operator to Bring Community Wasm to K8s'
categories: ['webassembly', 'wasmcloud', 'Cloud Native', 'CNCF', engineering, cloud native]
draft: false
---

![wasmCloud-operator)](/img/wasmcloud-operator-kubernetes.jpg)

**SEATTLE, (Open Source Summit), April 16, 2024**. In response to growing demand among engineers for more open and community-led ways to bring the benefits of WebAssembly (Wasm) to Kubernetes, Cosmonic has contributed its Kubernetes operator to the [CNCF wasmCloud](https://www.cncf.io/projects/wasmcloud/) ecosystem. The **wasmCloud-operator** (formerly known as Cosmonic Connect Kubernetes), allows Kubernetes practitioners free and unfettered access to wasmCloud in their own Kubernetes clusters, deployed and managed with the tools they know and trust.

<!--truncate-->

Built by Kubernetes experts to conform to standard Kubernetes integration patterns, the [wasmCloud-operator](https://wasmcloud.com/docs/deployment/k8s/) brings the extensibility of WebAssembly to Kubernetes. It simplifies the deployment _and distribution of_ wasmCloud applications to even the most remote locations; something Kubernetes struggles to do well. Unlike alternative solutions that insist on lower level infrastructure integration—forcing engineers to change the way they manage their clusters—the wasmCloud-operator offers a way to layer wasmCloud on top of Kubernetes without sacrificing preferred solutions. As a result, the value of major Kubernetes investments is extended and enhanced, without costly and complex integration.

Taylor Thomas, wasmCloud maintainer and Cosmonic’s Director of Customer Engineering says: "Kubernetes works brilliantly for managing infrastructure, but it isn’t great at running applications—particularly those operating at the edge. Engineers see the value of Wasm, especially its portability, but are worried about the technical path to get there; they want to protect their Kubernetes investments. The wasmCloud-operator allows platform engineers to manage and run Wasm on their existing Kubernetes clusters in a way that feels familiar to them, bringing the kind of extensibility to Kubernetes that was previously impossible.”

### WebAssembly on Factory Floors

Industrial analytics company [MachineMetrics](https://www.youtube.com/watch?v=fQdkNGZqYZA) is one of the first to implement wasmCloud to improve the performance of manufacturing machinery on factory floors. They use wasmCloud on their edge devices and in their Kubernetes Clusters (managed by Argo CD) to deploy some of their data processing workloads. The manager of the Data Platform team at MachineMetrics, Jochen Rau, explained in a recent [wasmCloud Community Meeting](https://wasmcloud.com/community/2024/03/27/community-meeting), they already have the wasmCloud-operator up-and-running in their Kubernetes environments: “We’ve been able to get started really fast with the operator. In a hybrid environment like IIoT, it’s been awesome to be able to define wasm components centrally and deploy them seamlessly to Kubernetes, in the Cloud as well as edge devices.”

### Deploying wasmCloud Applications with Kubernetes

The wasmCloud-operator closely integrates with [Wadm](https://wasmcloud.com/docs/deployment/wadm/), wasmCloud’s component-native orchestrator, so engineers can directly manage the lifecycle of wasmCloud hosts and applications with tooling that already exists in Kubernetes.

For those working with GitOps in Kubernetes—particularly Argo CD or Flux enthusiasts—they can check a Wadm manifest into Git and deploy their wasmCloud applications in the same way they would for any other Kubernetes application. Dan Norris, wasmCloud maintainer and creator of the wasmCloud-operator, explains: “By providing a Kubernetes-native API for interfacing with wasmCloud applications, all the familiar deployment tools just work. There’s nothing special for users to do—it’s just a kubectl apply with Wadm.”

### Multi-Cluster Kubernetes Federation

Since the beginning, Kubernetes has been laser-focused on managing applications and infrastructure for a single cluster. There are some open source projects, and even efforts from the Kubernetes project, trying to make it easier to manage applications across multiple clusters. Deploying applications across clusters means replicating manifests which, right now, needs to be done with some sort of an external process. The wasmCloud-operator allows you to easily deploy applications across multiple clusters, since application state is stored outside of a local Kubernetes cluster. This is because of the underlying foundation that wasmCloud is built on [NATS](https://nats.io/).

“It turns out we accidentally figured out Kubernetes federation when working on this operator,” says Norris. “Because application state is backed by wasmCloud and that isn’t necessarily tied to a single cluster, it means that if you install the wasmCloud-operator on multiple clusters and do a deploy, those clusters will automatically create and manage applications, and all of their associated Kubernetes resources, without you needing to do anything.”

This ability provides cluster operators with entirely new models of multi-cluster flexibility that they’ve never had before.

### Full Support for WASI 0.2 and Components

The availability of WASI 0.2 and the Component Model has added a fresh dimension to Wasm portability. Components are portable across infrastructure and operating systems, and across languages. wasmCloud 1.0 brings all the goodness of WASI 0.2 to life, and those benefits permeate the entire ecosystem. Norris says: “The wasmCloud-operator easily hooks in the standard WASI HTTP interface into Kubernetes networking primitives. If you create and manage a wasmCloud application that is listening on HTTP, for instance, we automatically create a Kubernetes service directing requests to all of the hosts that are running that wasmCloud application. This means you can integrate your existing service meshes and legacy applications with standard interfaces that work anywhere components are supported.”

### Host Abstraction

What’s different about the wasmCloud-operator is that it allows users to provision and manage a set of wasmCloud hosts, each belonging to their own namespace. Norris says: “It is driven by a simple CRD which, for anyone experienced with Kubernetes, will look very familiar. It allows you to manage wasmCloud hosts in a way that is familiar to Kubernetes administrators while allowing you to reuse all of the abstractions—everything engineers would expect.”

Thomas concludes: “Wasm does not wholesale replace containers, it runs alongside containers; allowing us to extract all the goodness we’re used to in Kubernetes, while affording the possibility to extend the use of our applications to the places Kubernetes doesn’t run well.”

Join Taylor Thomas for his Open Source Summit talk, Tuesday 16th April at 12.15pm: [Mind the Gap Between the Future and the Present](https://sched.co/1aBMt).

[Take part in discussion on the wasmCloud Slack.](https://wasmcloud.slack.com/)
