---
title: "NATS Connections"
date: 2018-12-29T11:02:05+06:00
weight: 3
draft: false
---

NATS forms the connective tissue that stitches together all of the wasmCloud hosts within a lattice. Each host requires two connections:
* A control plane connection
* An RPC connection

Securing these connections should be a _top priority_ for the security of your deployed application. Never rely on the **zero trust** behavior of other components to properly handle intrusion detection and the blocking of malicious actors.

For information on how to properly secure your NATS servers, clusters, superclusters, and leaf nodes, please consult the [NATS security documentation](https://docs.nats.io/developing-with-nats/security). 

wasmCloud embraces the decentralized security system based on JSON Web Tokens, accounts, and users that has been part of NATS since the 2.0 release. Much of our tooling will only allow you to authenticate to NATS using either an anonymous or decentralized JWT-based session.

While you do not _have_ to use different credentials for the RPC and control interface, we _highly_ recommend this practice in production environments as it prevents compromised credentials from one connection being applied to another.

To counteract any potential eavesdropping activity, you'll want to ensure that you use TLS to communicate with NATS.