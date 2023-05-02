---
title: "Link Definitions"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 1
draft: false
---
An overview of link definitions and their role.

<!--truncate-->

A **_link definition_** is a declared set of configuration values between a specific actor (identified by its public key) and a specific capability provider (identified by its contract ID, link name, and public key). At first glance it may seem like the "key" for this bi-directional relationship contains redundant information, but remember that there are 3 different consumers of this relationship: 

* the host runtime
* the actor
* the capability provider.

From the actor's point of view, code written using an actor interface _only_ refers to the combination of a contract ID and a link name, e.g. `wasmcloud:keyvalue` and `default`. This is because actors do not know about (nor should they ever) _which_ specific capability provider is responsible for supporting the contract on which they depend. The choice of _which_ provider satisfies a given contract for an actor is a choice that is _always_ made at _runtime_.

From the capability provider's point of view, it only ever dispatches messages to actors or receives messages from actors. When a link is established for a particular actor, the capability provider can remember that actor's public key and use it for subsequent dispatches. As a result, the only information a capability provider needs is the actor public key. The actor key is typically used as a key for managing resources on behalf of the actor, such as database connections, open TCP sockets, etc.

From the wasmCloud host runtime's point of view, it _must_ know the following information when establishing a link between capability provider and an actor:

- The actor's public key (which it can obtain indirectly via an [OCI reference](/docs/production/oci/)
- The contract ID (e.g. `wasmcloud:keyvalue` or `wasmcloud:httpserver`)
- The public key of the capability provider
- The link name of the capability provider, which is actually a runtime attribute of a loaded instance of a capability provider. Any link name that is missing/unsupplied will be called `default`.

To help illustrate the need for link names to disambiguate providers, consider the following scenario:

Assume that we have two capability providers in the lattice that implement the `wasmcloud:keyvalue` contract: a **Redis** capability provider with the link name `default`, and an **in-memory** cache provider running with the link name `cache`. Additionally, there is a **Consul** key-value provider with the link name `default`. If the link definition connecting an actor and provider only contained contract ID and link name, the host runtime would not have enough information to determine if an actor's request should go to the **Redis** provider or to the **Consul** provider. A core function of wasmCloud is message routing. It needs enough information to establish routes between actors and capability providers.

It's for this reason that every link definition declaration must include (directly, or indirectly via OCI) a provider's unique public key and the provider's link name.

### Link Definitions at Runtime

Link definitions are declared, first-class citizens of a lattice network. This means that a link definition can be declared _before or after_ any of the pertinent parties of that link are running in the lattice. Each time a capability provider is started, it is provided with a list of pre-existing link definitions that pertain to that provider. Additionally, the provider is notified via NATS on the RPC connection whenever new link definitions are created and when link definitions are removed.

This has a few interesting implications. The first is that it makes for an incredibly low-friction developer experience. Order of operations does not matter - you can add actors and providers to a host, and their corresponding link definitions to the lattice in any order and it "just works". The second is that all capability providers must treat the "bind actor" message as idempotent, and return a positive result and ignore duplicate bind messages.

#### ⚠️ Immutable Links

Our discussion leads us to an important, yet subtle point: **_link definition values cannot be changed at runtime_**. If you have previously declared that a given link between an actor and, say, an HTTP server provider, utilizes port `8080`, then there is _nothing_ that can be done at runtime to _change_ that port number. This is a security measure first and foremost, and a reliability/consistency measure secondarily.

If you could change the configuration at runtime, then you could very easily have divergence between the actual and declared configuration. Further, the consequences of changing configuration values at runtime are unknowable by the platform... sometimes even the application developers may not know the consequences.

As a result, if you truly must change configuration at runtime, you must **remove** a link definition (causing the actors and providers involved to "un bind" and release all related resources, HTTP ports, sockets, DB connections, etc) and then add back a new one with the new values.
