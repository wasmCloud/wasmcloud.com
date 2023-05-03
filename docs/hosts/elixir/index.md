---
title: "Elixir Host (OTP)"
date: 2020-01-19T00:00:00+00:00
icon: "ti-map" # themify icon pack : https://themify.me/themify-icons
description: "Introduction to the Elixir Host"
type: "docs"
sidebar_position: 6
---

wasmCloud's [Elixir host](https://github.com/wasmcloud/wasmcloud-otp) is the primary, fully supported, actively maintained host runtime. This application can be used for development on your laptop and globally distributed deployments in production clouds.

Elixir (and Erlang and the BEAM VM beneath it) is extremely good at supporting internal concurrency without forcing developers to deal with low-level concepts like mutexes and OS threads. The [OTP runtime](https://www.erlang.org/doc/design_principles/des_princ.html) has had decades of battle testing under the most crushing production workloads and wasmCloud can leverage that expertise by default.

New features and developments for host runtimes are first made available in the shared [Rust wasmCloud runtime](https://github.com/wasmcloud/wasmcloud), and then added to the Elixir host if applicable.