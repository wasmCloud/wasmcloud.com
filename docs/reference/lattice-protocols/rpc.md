---
title: "RPC"
date: 2018-12-29T11:02:05+06:00
weight: 2
draft: false
---

At its core, the _lattice_ is essentially a _Remote Procedure Call (RPC)_ bus layer built on top of the NATS message broker. When the lattice
is enabled, participants in lattice RPC must conform to a set of standards in order to be able to send and handle messages.

Lattice RPC supports the following interaction modes:

* Actor-to-Actor
* Actor-to-Provider
* Provider-to-Actor

ℹ️ All RPC interactions take place on a NATS client connection that is separate from the control interface for security reasons. All requests and replies on the RPC connection are serialized via [message pack](https://msgpack.org/index.html).

### The invocation

All RPC interactions within the lattice involve sending an `Invocation` and receiving an `InvocationResponse`. Even
if the operation is "fire and forget", the `InvocationResponse` is required to indicate a successful acknowledgement of the invocation.

Because these structures are used in multiple places by multiple languages, you can find them in different places throughout the code base. Here are a couple of locations:
* The Smithy [Interface](https://github.com/wasmCloud/interfaces/blob/main/core/wasmcloud-core.smithy#L143) - smithy models are considered authoritative as language-specific implementations should be generated from these IDL models.
* The [wasmCloud OTP Host Runtime](https://github.com/wasmCloud/wasmcloud-otp/blob/main/host_core/native/hostcore_wasmcloud_native/src/inv.rs#L23) - There is a Rust implementation of the `Invocation` and `InvocationResponse` structs used by the host.

The following is a description of the fields on an `Invocation`:
| Field | Type | Description |
| :--- | --- | :--- |
| `id` | `String` (GUID) | Unique invocation ID. The response to this invocation will carry this value for correlation. |
| `origin` | `WasmCloudEntity` | The sender of the invocation. |
| `target` | `WasmCloudEntity` | The intended recipient of the invocation. |
| `operation` | `String` | The operation string of this invocation, e.g. `HttpServer.HandleRequest` or `Messaging.DeliverMessage` |
| `msg` | `Bytes` | The raw bytes of the message. |
| `encoded_claims` | String |  A signed, encoded JSON Web Token (JWT) containing the claims for this invocation. These claims include a hash of the invocation itself. |
| `host_id` | String | The _public key_ of host from which the invocation originated. |

These are the fields on the `WasmCloudEntity` structure:
| Field | Type | Description |
| :--- | --- | :--- |
| `public_key` | String | The public key of the entity. Will begin with **M** for actors, **V** for providers |
| `contract_id` | String | The contract ID of the entity. Left blank if this entity is an actor. |
| `link_name` | String | Link name of the entity. Left blank if this entity is an actor. |

### Invocation Claims

Lattice RPC enforces a measure of security in RPC calls over and above the security required to obtain a NATS connection. Each `Invocation` contains an `invocation_claims` field. This field is a _signed_ and encoded JSON Web Token (JWT). A **cluster seed** is used to sign the invocation claims. Invocation claims include a **hash** which is used to verify that the invocation data has not been tampered with. This hash includes the following fields (hashed in this order):
1. `origin_url` - A URL-encoded version of a `WasmCloudEntity` indicating the origin
1. `target_url` - A URL-encoded version of a `WasmCloudEntity` indicating the target
1. `operation` - The operation string
1. `msg` - The actual payload bytes of the invocation

If you're looking to construct your own invocations manually, you'll need this hash to be a SHA256 digest encoded in "hex uppercase".

The reason we go to such lengths with the invocation is to prevent a malicious entity that has compromised enough credentials to gain access to an RPC NATS connection from actually performing any function calls. Without a valid **cluster seed** (which is injected into a host runtime at startup), an intruder cannot forge an invocation, even if they have unfettered access to NATS.

Monitoring tools could be configuted to detect faked invocations in real time and produce alerts.

The claims data structure can be found in the [wascap](https://github.com/wasmCloud/wascap/blob/main/src/jwt.rs) crate.

### Actor subscriptions

All actors that are in hosts connected to a lattice will **queue** subscribe to incoming invocations on the following topic:

`wasmbus.rpc.{namespace}.{actor public key}`

For example, the `echo` sample in wasmCloud's official OCI registry would subscribe to the following topic if no alternative namespace prefix were supplied:

`wasmbus.rpc.default.MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5`

The use of a queue subscription is important because it causes NATS to randomly choose a target from among all running instances of a subscriber. That's the key piece of networking mechanics that allows actors to scale horizontally within a lattice.

If you have sufficient access and want to see _exactly_ which subjects are being used for lattice communication, you can simply launch NATS with verbose and debug options enabled.

### Capability provider subscriptions

Capability providers also **queue** subscribe to incoming invocations from _linked_ actors on the following topic pattern:

`wasmbus.rpc.{namespace}.{provider public key}.{provider link name}`

For example, if the NATS message broker capability provider were loaded into a host using the `backend` link name on
a lattice with a namespace prefix of `prod`, the subscription topic for the capability provider would be:

`wasmbus.rpc.prod.VADNMSIML2XGO2X4TPIONTIC55R2UUQGPPDZPAVSC2QD7E76CR77SPW7.backend`

The link names allow multiple instances of the same capability provider to be started with different configurations or purposes. For example, one common use of link names we've used is to use the NATS message broker with a `backend` and a `frontend` set of logical link names, so the same actor can be bound to the NATS provider twice with two logical purposes. Other times you may want to use two different link names for the same provider contract to support two logically different database purposes.

#### Additional topics

Capability providers must also subscribe to topics that contain messages indicating the addition and removal of link definitions. For security reasons, providers are only ever notified of link definitions that pertain to them. The following topics are mandatory subscriptions for providers to handle link definitions:

* `wasmbus.rpc.{prefix}.{public_key}.{link_name}.linkdefs.put` - Adds a link definition. The payload on this subject (remember all RPC payloads are _message pack_) is the `LinkDefinition` struct which you can find in the [core interface](https://wasmcloud.github.io/interfaces/html/org_wasmcloud_core.html#link_definition).
* `wasmbus.rpc.{prefix}.{public_key}.{link_name}.linkdefs.del` - Deletes a link definition. The payload on this subject is also a `LinkDefinition` struct.

Lastly, capability providers must subscribe to (and respond on) the following health check topic. Providers that do not properly respond on this topic will be flagged as "unhealthy" by the system. While the host runtime may not take action, other external entities could use this information to terminate the provider.

* `wasmbus.rpc.{prefix}.{public_key}.{link_name}.health`