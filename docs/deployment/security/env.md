---
title: "Environment Variables"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 1
draft: false
---

Environment variables are the primary means by which the wasmCloud host obtains configuration. For a list of the environment variables supported by the Elixir host, check out the [host configuration](/docs/hosts/elixir/host-configure) section.

When it comes to environment variables, there are, however, some security pitfalls into which it is remarkably easy to fall. In many production scripts that we've seen in the past, environment variables are set on the command line along with invoking the script, e.g.

```shell
$ ENV_VAR_1=foo ENV_VAR_2=bar ./startapp
```

The downside to this is that anyone on the same server with access to the process list (generally less secure than explicitly-owned folders) can see all commands used to start all processes. As a precaution, we recommend not following this pattern and instead setting environment variables _prior_ to the execution of a process like the wasmCloud host.

We support the use of **.env files**, a loose standard around supplying a hierarhical set of files for setting up environment variables to be used by a process. You can also explicitly set environment variables in whatever script you use to launch the wasmCloud host.

In summary, environment variables used by wasmCloud host can contain sensitive information (especially signing keys, which are discussed next), and you need to plan around this and take as many measures as possible to keep environment variable data secure.
