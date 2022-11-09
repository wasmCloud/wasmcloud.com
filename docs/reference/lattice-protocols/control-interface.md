---
title: "Control interface"
date: 2018-12-29T11:02:05+06:00
weight: 3
draft: false
---

The lattice control interface provides a way for clients to interact with the lattice to issue control commands and queries. This interface is a message broker protocol that supports functionality for starting and stopping actors and providers, declaring link definitions, monitoring lattice events, holding _auctions_ to determine scheduling compatibility, and much more.

The core message broker protocol can be used by any client capable of connecting to NATS. There is also a [wasmcloud-control-interface](https://docs.rs/wasmcloud-control-interface/0.4.4/wasmcloud_control_interface/) Rust crate that provides a convenient API for accessing the control interface.

ℹ️ All control interface interactions take place on a _separate_ NATS client connection from the RPC connection for security reasons. All requests and replies on the control interface connection are serialized via **JSON**.

### NATS control interface

The following is a list of the operations supported by the control interface.

All of the control interface messages published on NATS topics use a standard prefix. This prefix is `wasmbus.ctl.{namespace}` where `namespace` is a string used to differentiate one lattice from another. Note that this namespace must correspond to the namespace prefix of the lattice you intend to control.

⚠️ You must ensure that your namespace prefix is alphanumeric and does not the contain `/` or `.` or `>` characters, as those have special meaning to the NATS message broker.

All control interface messages conform to the schema found in the [control interface](https://wasmcloud.github.io/interfaces/html/org_wasmcloud_interface_control.html) smithy model. Assume a `wasmbus.ctl.{prefix}` topic prefix for all of the topics listed below.

| Topic               | Type | Description                                                                  |
| :------------------ | :--- | :--------------------------------------------------------------------------- |
| `auction.provider`  | Req  | Hold an auction for starting a provider                                      |
| `auction.actor`     | Req  | Hold an auction for starting an actor                                        |
| `cmd.{host}.la`     | Req  | Tell a host to start (_launch_) an actor                                     |
| `cmd.{host}.sa`     | Req  | Tell a host to stop an actor                                                 |
| `cmd.{host}.scale}` | Req  | Scale a given actor to a specific number of instances                        |
| `cmd.{host}.lp`     | Req  | Tell host to launch provider                                                 |
| `cmd.{host}.sp`     | Req  | Tell host to stop provider                                                   |
| `cmd.{host}.upd`    | Req  | Tell host to live-update actor                                               |
| `get.links`         | Req  | Query link definition list                                                   |
| `get.claims`        | Req  | Query claims cache                                                           |
| `get.{host}.inv`    | Req  | Query host running inventory                                                 |
| `linkdefs.put`      | Req  | Put a link definition into the lattice                                       |
| `linkdefs.del`      | Req  | Delete a link definition from the lattice                                    |
| `ping.hosts`        | Coll | Collect list of all running hosts by emitting a ping and gathering responses |

Operations of type `Sub` are subscribe-only. A lattice control interface client may subscribe to this event stream, but _should never publish to it_. A good security scenario is to have a different set of lattice connection credentials for the wasmCloud host than you use for the control client. This allows you to prevent the control client from publishing to potentially dangerous topics.

Operations of type `Req` are requests that receive replies. These replies may be simple acknowledgements and may not directly indicate completion of work. For example, starting an actor and provider will receive an **ack** as soon as the request is _validated_--the host will not wait until the full start operation is finished.

Operations of type `Coll` are _collect_ or _scatter-gather_ operations that issue a request on a subject and then wait for some given period of time to collect responses. Use caution with collect/gather operations because if you do not wait long enough, you may receive incomplete responses.

### Lattice Events

Lattice events are published on the stream `wasmbus.evt.{prefix}` where `prefix` is the lattice
namespace prefix. Lattice events are JSON-serialized [CloudEvents](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md) for easy, standardized consumption. This means that the `data` field in the cloud event envelope is just another JSON object and does not need to be decoded further.
