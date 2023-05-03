---
title: "Overview of the Actor Model"
date: 2020-05-01T00:00:00+00:00
icon: "ti-anchor" # themify icon pack : https://themify.me/themify-icons
description: "Actors overview"
sidebar_position: 0
type: "docs"
---

If you're already familiar with the computer science concepts of the [actor model](https://en.wikipedia.org/wiki/Actor_model) and have experienced implementations in other projects or tools, feel free to [skip to the next section](./wc_actors).

In the actor model, the **actor** is the primitive building block of concurrent computation. Actors receive messages, perform work, send messages, and respond to messages. This model has been around since **1973** and is proof that some designs can be meaningful and applicable today, no matter how old they are.

It's important to note that there are multiple perspectives when it comes to the actor model. There is a more rigid, academic definition and then there are the practical concerns of building real world applications that tend to stretch or modify that definition.

The academic definition of actors calls for them to be able to perform the following tasks _concurrently_:

* Send messages to other actors
* Create new actors
* Alter internal state
* Make local decisions
* Choose how to react to the next message

Implicit in this list is the rule that actors can't modify or directly read the state of other actors. The only way data is exchanged between entities in this system is through messages. There are a _ton_ of amazing resources on this concept, and if you're interested we highly recommend that you track down some of the references in the Wikipedia article.

The above is the academic definition. wasmCloud needs to temper the academic concept of actors with some practical concerns that arise from the need to manage **secure** and **resilient** distributed workloads.

### Actor State
wasmCloud actors are **stateless**. This is what allows us to run hundreds or thousands of copies of the same actor across a cluster to horizontally scale compute throughput. If an actor needs state, then it can obtain state easily through the use of a capability provider. By using a capability provider for state, wasmCloud can ensure that no matter which instance of an actor is invoked, or where it's running in the cluster, it can still reliably access its bound state provider.

Providers like the [concordance](https://github.com/cosmonic/concordance) event sourcing provider create a developer experience that feels very much like internally stateful actors, while still optimized for distributed systems.

### Supervision
Actor supervision is a hallmark of the actor model. If you're used to systems like [Akka](https://akka.io/), where an application is one big supervision tree, and the only way to start an actor is from inside another actor, then wasmCloud's supervision model may seem awkward to you.

In a zero trust environment, entrusting actors with the ability to spawn other actors is risky. wasmCloud hosts maintain the horizontal scale of actors with an entirely flat hierarchy. WasmCloud actors do not supervise other actors.
