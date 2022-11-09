---
title: "Security patterns"
date: 2018-12-29T11:02:05+06:00
weight: 6
draft: false
---

There are a virtually limitless number of ways in which you can deploy and configure the NATS substrate that supports your lattice. The following are just a few of the common _security_ patterns that we recommend for deploying NATS for your wasmCloud applications.

### Sidecar leaf node

In this pattern, each wasmCloud host runtime process is deployed on a host (virtual, container, etc) either alongside a NATS server process or connected to the same _local_ network as that host (e.g. docker compose shared network interface, Kubernetes pod network, etc).

This NATS server is configured as a leaf node. The leaf node authenticates _securely_ over TLS, ideally using de-centralized credentials (JWT+seed) to some other NATS server. This NATS leaf node server is configured to _only_ listen on localhost on a fixed port for client connections.

Because NATS is only allowing localhost connections, only those processes that share the same network interface can communicate with it. This type of "anonymous localhost" connection is commonly used in the [sidecar](https://docs.microsoft.com/en-us/azure/architecture/patterns/sidecar) pattern, which is why we've labelled this this "sidecar leaf node" pattern.

For the truly security conscious, you could also choose to allow the NATS leaf node to accept decentralized authentication credentials. These credentials would be different from those used by the leaf node to connect "upstream", and would be for an entirely different security boundary. The key take-away from this pattern is that the security context used by the leaf node to connect upstream is unrelated to the security context used by local clients to connect to the leaf node.

This pattern provides an incredibly simple developer experience because on a development laptop you can simply replace the leaf node with a regular NATS server and still have a fully functioning lattice.

### Secure direct connections

If your infrastructure needs don't support the sidecar pattern, then you can simply securely connect to a remote NATS server or NATS server cluster (or [gateway](https://docs.nats.io/nats-server/configuration/gateways)... there are plenty of options). We strongly recommend the use of the de-centralized JWT+seed (credentials file) authentication mechanism because of its enhanced security properties and ease of use.

You should never connect anonymously or without TLS to a remote NATS installation for production uses. Anonymous/insecure connections are only secure in the sidecar/localhost scenario.

### User/password not supported?

You may have noticed that while NATS supports clear text username and password authentication, we do not support this for wasmCloud lattice authentication. We have chosen instead to support either anonymous connections or de-centralized authentication connections. If you feel that there is suitable justification to support username and password lattice authentication, please [file an issue](https://github.com/wasmCloud/wasmcloud-otp/issues) with the team.
