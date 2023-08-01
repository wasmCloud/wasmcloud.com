---
title: "Overview of the Actor Model"
date: 2020-05-01T00:00:00+00:00
icon: "ti-anchor" # themify icon pack : https://themify.me/themify-icons
description: "Actors overview"
sidebar_position: 0
type: "docs"
---

If you're already familiar with the computer science of the
[actor model](https://en.wikipedia.org/wiki/Actor_model)
and have experience implementing actors in other projects or tools,
feel free to [skip to the next section](./wc_actors).

The actor model is a model of concurrent computational that's been around since
**1973** and is as meaningful and applicable today than it was 50 years ago.
In this model, the **actor** is the primitive building block
of concurrent computation.
Actors are "black-box" computational entities that can only communicate with
other actors by passing messages and creating new actors.

The academic definition of actors calls for them to be able to perform the following tasks _concurrently_:

* Send messages to other actors
* Create new actors
* Alter their own internal state
* Make local decisions
* Choose how to react to the next message

Implicit in this list is the rule that actors can't modify or directly read the state of other actors. The only way data is exchanged between entities in this system is through messages. There are a _ton_ of amazing resources on this concept, and if you're interested we highly recommend that you track down some of the references in the Wikipedia article.

**Note:** While it's possible to implement the actor model using these strict, academic
constraints, wasmCloud must temper them with some practical concerns that arise
from the need to manage **secure** and **resilient** distributed workloads.

### Stateless Actors
wasmCloud actors are **stateless**, allowing hundreds or thousands of copies
of an actor to be horizontally scaled across a cluster to meet compute demands.
When an actor needs state, it obtains it easily through the use of a capability provider.
By using capability providers, wasmCloud can ensure that no matter
which instance of an actor is invoked, or where it's running in the cluster,
it can still dynamically respond to the state of the larger application.

Providers like the [concordance](https://github.com/cosmonic/concordance) event sourcing provider create a developer experience that feels very much like internally stateful actors, while still optimized for distributed systems.

### Centralized Supervision
Actor supervision is a hallmark of the actor model. If you're used to systems like [Akka](https://akka.io/), where an application is one big supervision tree, and the only way to start an actor is from inside another actor, then wasmCloud's supervision model may seem awkward to you.

wasmCloud actors do not supervise other actors.
In a zero trust environment, allowing actors to spawn more is a security risk.
wasmCloud hosts maintain the horizontal scale of actors with an entirely flat hierarchy.
