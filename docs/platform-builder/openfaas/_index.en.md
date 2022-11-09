---
title: "Integrating with OpenFaas"
date: 2018-12-29T11:02:05+06:00
weight: 4
draft: false
---

[OpenFaas](https://www.openfaas.com/) makes it easy to deploy functions to Kubernetes. One question we get asked from time to time is how wasmCloud either competes against or integrates with **OpenFaas**. A guiding principle for wasmCloud's strategy is to be _compatible with_, not _competing against_, other projects within the [CNCF](https://www.cncf.io/) and larger ecosystem. It's very easy to design your actors so that they have a single handler function; making them look and operate a lot like stateless lambdas/cloud functions.

### Coming soon

We have an [issue in our backlog](https://github.com/wasmcloud/capability-providers/issues/27) for developing a wasmCloud _capability provider_ that will act as a "Faas Provider". Such a provider would act as a reverse proxy allowing function invocations to originate from an OpenFaas client and travel through the provider into a lattice-RPC invocation. This will let application and platform developers expose a subset of their actors to OpenFaas invocations.
