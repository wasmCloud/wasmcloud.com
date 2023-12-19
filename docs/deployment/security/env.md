---
title: "Environment Variables"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 1
draft: false
---

The wasmCloud host can obtain configuration via environment variables. (For a list of the environment variables supported by the host, check out the [host configuration](/docs/reference/host-config) section.)

However, there are security pitfalls related to environment variables. For example, consider setting environment variables on the command line along with invoking the script, e.g.

```shell
$ ENV_VAR_1=foo ENV_VAR_2=bar ./startapp
```

The downside to this is that anyone on the same server with access to the process list can see all commands used to start all processes. Since environment variables can contain sensitive information such as signing keys and authentication to registries, we recommend avoiding this pattern. Instead, **set environment variables _prior_ to the execution of a process like the wasmCloud host**.
