---
title: "Elixir Host (OTP)"
date: 2020-01-19T00:00:00+00:00
icon: "ti-map" # themify icon pack : https://themify.me/themify-icons
description: "Introduction to the Elixir Host"
type: "docs"
sidebar_position: 6
---

:::caution
wasmCloud's [Elixir host runtime](https://github.com/wasmcloud/wasmcloud-otp) has been deprecated. The [Rust wasmCloud runtime](https://github.com/wasmCloud/wasmCloud) is receiving all new features
:::

This application can be used for development on your laptop and globally distributed deployments in production clouds.

Elixir (and Erlang and the BEAM VM beneath it) is extremely good at supporting internal concurrency without forcing developers to deal with low-level concepts like mutexes and OS threads. The [OTP runtime](https://www.erlang.org/doc/design_principles/des_princ.html) has had decades of battle testing under the most crushing production workloads and wasmCloud can leverage that expertise by default.
