---
title: 'RPC'
date: 2024-08-09T11:02:05+06:00
sidebar_position: 2
draft: false
---

wasmCloud uses the ByteCode Alliance hosted project [wRPC](https://github.com/bytecodealliance/wrpc) for all distributed communication between components and capability providers. wasmCloud was the first reference implementation for wRPC, and was designed to make distributed communication between components to feel exactly like [composing components](/docs/ecosystem/wasmtime/#composition-and-the-runtime).

Components (via the wasmCloud host) and capability providers subscribe on NATS subjects to serve all `export`s as defined in their WIT interface. The subject is of the following form:

```console
{lattice}.{component_id}.wrpc.{protocol_version}.{namespace}:{package}/{interface}@{version}.{function}
```

For example, the subject is as follows when invoking the HTTP hello world component in our [quickstart](/docs/tour/hello-world.mdx):

```console
default.http-hello-world.wrpc.0.0.1.wasi:http/incoming-handler@0.2.0.handle
```

## Headers

In order to determine the source, target and link name of an invocation, wasmCloud includes the following headers on every wRPC invocation:

```console
source: <source_id>
target: <target>
link_name: <link_name>
```

## Debugging

You can subscribe to all traffic sent over wRPC using the following subscription:

```bash
nats sub "*.*.wrpc.>"
```

### References

See the [0.82 RPC Documentation](/docs/0.82/hosts/lattice-protocols/rpc) for information about the no-longer-supported wasmbus RPC protocol.
