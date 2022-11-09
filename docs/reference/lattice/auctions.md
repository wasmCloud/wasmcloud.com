---
title: "Scheduling Auctions"
date: 2018-12-29T11:02:05+06:00
weight: 12
draft: false
---

All hosts within a lattice are mandated to participate in _**auctions**_. An auction is when some consumer of the lattice control interface (e.g. the `wash` CLI or another application) publishes a set of _requirements_ to all hosts within the lattice. 

Each host is then responsible for determining whether or not it meets those requirements. If it does meet those requirements, the host will respond to the auction. Auctions follow the _scatter-gather_ pattern to probe and then collect information.

There are a number of reasons why you might want to hold an auction, but the number one reason is for _scheduling_. A _scheduling auction_ is an auction where a target/destination host is chosen from among the auction _winners_, and then an actor or capability provider is then launched on this host.

### Specifying Requirements
In the current version of the lattice protocol, the set of requirements are defined as a set of label name-value pairs. A host meets these requirements _only if_ **all** of the name-value pairs are defined on the host.

In the future we may support a more robust way of specifying requirements and the label values on hosts, but today's auctions are simple key-value pairs combined with **AND** logic.

### Examples
If you want to deploy a capability provider to a host that is known to support the **[GPIO](https://en.wikipedia.org/wiki/General-purpose_input/output)** interface (it has hardware attached via GPIO), then you might add the label `gpio` with the value of `true` to each host in the lattice that has attached GPIO hardware. To then hold an auction to determine which hosts might be suitable for this capability provider, you would set the requirements of the auction to `gpio=true` and pick a destination host from among the winners.

If you want to ensure that a given actor is targeted at a host running in the `us-east` availability zone, you might label hosts in that zone by setting the `az` label value to `us-east`. You could then hold an auction requiring `az=us-east`, knowing that all "winning" hosts in this auction would be in this availability zone and thus be suitable vessels for the actor in question.

Auctions are deliberately flexible and work with opaque label-value pairs, giving you the flexiblity and power of arranging whatever lattice partitions you need for your auctions.