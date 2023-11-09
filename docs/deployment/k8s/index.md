---
title: "Kubernetes Integration"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 6
draft: false
---

Although we think WebAssembly is the future, we know that there are plenty of things running in Kubernetes, and that people often have easy access to run in a Kubernetes cluster somewhere.

## Official wasmCloud Helm Chart

To make it easy for you to try out wasmCloud and/or integrate it with what you already have running, we've created an [official Helm chart][helm-chart].

To get started quickly and see usage examples, read the ["Running the Chart" guide][helm-chart-quickstart], on the [chart README][helm-chart-docs].

For a complete listing of configuration for the Helm chart, jump straight to the [`values.yaml`][helm-chart-values.yaml].

[helm-chart]: https://github.com/wasmCloud/wasmCloud/blob/main/chart/Chart.yaml
[helm-chart-docs]: https://github.com/wasmCloud/wasmCloud/tree/main/chart
[helm-chart-values.yaml]: https://github.com/wasmCloud/wasmCloud/blob/main/chart/values.yaml
[helm-chart-quickstart]: https://github.com/wasmCloud/wasmCloud/tree/main/chart#running-the-chart

## Kubernetes Service Applier

Cosmonic has open sourced a basic connector that allows you to bridge services currently running in Kubernetes with services that you run in wasmCloud.

The interface, provider, and actor can be found at [on Github under `cosmonic/kubernetes-applier`][k8s-applier].
You can also check out the project's [documentation][k8s-applier-readme] for a
complete example architecture and instructions on how to run it.

[k8s-applier]: https://github.com/cosmonic/kubernetes-applier
[k8s-applier-readme]: https://github.com/cosmonic/kubernetes-applier/tree/main/service-applier#readme
