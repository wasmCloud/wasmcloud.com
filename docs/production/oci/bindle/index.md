---
title: "Bindle"
date: 2021-12-29T11:02:05+06:00
sidebar_position: 5
draft: false
---

As of wasmCloud host version 0.52, wasmCloud has _experimental_ support for using
[Bindle](https://github.com/deislabs/bindle) instead of OCI for Providers and Actors. Bindle is an
experimental new storage format designed with WebAssembly in mind. In particular, it adds signing
and selective artifact downloading that is of particular value to wasmCloud.

:::caution
This is experimental, which means things could change, break, or be removed at any
time. We will do our best to document any breaking changes. Use the features described in this
section at your own risk.
:::
