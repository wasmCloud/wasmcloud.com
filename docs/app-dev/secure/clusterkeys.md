---
title: "Cluster Keys and Issuers"
date: 2018-12-29T11:02:05+06:00
weight: 2
draft: false
---

The concept of cluster **keys** and **issuers** is a classic example of an architectural pattern based on [zero trust](https://www.crowdstrike.com/cybersecurity-101/zero-trust-security/) environments. Once a wasmCloud host has authenticated with its 2 NATS connections (discussed next), that host is open to sending and receiving both control signals and Remote Procedure Call (RPC) traffic.

If we don't secure that traffic, then anyone with compromised access to the NATS cluster will have unfettered access to communicate with actors and providers, potentially causing production outages or worse, data exfiltration.

### Zero Trust Invocations
What does it mean for invocations (the RPC portion of the wasmCloud host's NATS protocol) to be "zero trust"? In short, the host does not _assume_ that the sender of any invocation is authorized to do so. We need to _verify_ the invocation we received for authenticity and authorization.

This verification happens in multiple phases. The first step requires that an embedded JSON Web Token (JWT) be placed on the invocation. The signature on this JWT is verified, _requiring that the entity signing this token must be among the list of valid cluster issuers known to the host_. This keeps anyone from signing an invocation JWT that doesn't possess one of the known keys (which should be kept separate for different environments, especially production).

Next, we examine the contents of the JWT. We verify that the invocation has not been tampered with since its signing by verifying the hash of the invocation's target, origin, operation, and payload. Finally, we verify that the **subject** of the JWT matches the unique ID of the invocation.

### Key Management
Zero trust security often comes with burdens, either for developers or operations staff. In wasmCloud's case, when deployed to any real environment, **key management** is crucial. You will need to maintain a set of valid seed (private) keys and their corresponding public keys in order to pass them in the `WASMCLOUD_CLUSTER_SEED` and `WASMCLOUD_CLUSTER_ISSUERS` environment variables.

Each host must be given _a single_ cluster seed that it uses for _signing_ invocations, and one or more public keys that identify the list of valid issuers (invocation signers) in the lattice. If you don't supply these values, an _ad hoc_ key and issuer will be generated and you'll be limited to a single-node lattice regardless of NATS connectivity.

Not managing these variables, or managing them incorrectly, will result in multiple hosts within the same lattice not being able to communicate with each other despite having access to the same NATS topic space.

### Summary
All of this security in a zero-trust environment means that no one can manufacture their own invocations to pretend to be a legitimate member of the lattice without compromising a known, existing key. Further, replay attacks won't work because anything responsible for de-duping invocations will easily see the reuse of an already-transmitted invocation. Man-in-the-middle (MITM) attacks are also not possible because we verify that the contents of an invocation have not changed since being signed.