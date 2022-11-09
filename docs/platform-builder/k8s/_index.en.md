---
title: "Running on Kubernetes"
date: 2018-12-29T11:02:05+06:00
weight: 3
draft: false
---

Although we think WebAssembly is the future, we know that there are plenty of things running in
Kubernetes, and that people often have easy access to run in a Kubernetes cluster somewhere. To make
it easy for you to try out wasmCloud and/or integrate it with what you already have running, we have
an [official Helm chart](https://github.com/wasmCloud/wasmcloud-otp/tree/main/wasmcloud_host/chart).
See its documentation for specific configuration and usage examples.

## Kubernetes Service Applier

Cosmonic has open sourced a basic connector that allows you to bridge services currently running in
Kubernetes with services that you run in wasmCloud. The interface, provider, and actor can be found
at https://github.com/cosmonic/kubernetes-applier. You can also check out the project's
[docs](https://github.com/cosmonic/kubernetes-applier/tree/main/service-applier#readme) for a
complete example architecture and instructions on how to run it.
