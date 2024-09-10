---
title: 'Leaf Node Config (JetStream)'
sidebar_position: 3
---

NATS leaf nodes are a simple concept but they enable an incredible amount of power, flexibility, and use cases. A leaf node allows NATS servers to bridge or join security domains. On any given server, you can set up [leaf node remotes](https://docs.nats.io/running-a-nats-service/configuration/leafnodes) that tether one account space on one side of the node to a different account space on the other side of the node.

This simplicity and power makes leaf nodes work like a universal connector for stitching together disparate infrastructures and they are part of the magic sauce that makes wasmCloud lattices so powerful.

Crossing the leaf node boundary is typically a seamless thing, but when we get into having JetStream messages cross that boundary, we need some additional configuration in our NATS server(s).

JetStream functionality is (oversimplification warning...) exposed over a root `$JS...` topic space. NATS leaf nodes actually set up a **blocking rule** for this topic to prevent JetStream messages from passing through the leaf node boundary. This blocking rule is configured based on the configured JetStream domain of the server.

wasmCloud's distributed lattice cache utilizes a JetStream stream. This means that if you want to run wasmCloud hosts that communicate with each other across one or more intervening leaf nodes, you'll need to compensate for this blocking rule using the concept of a [JetStream domain](https://docs.nats.io/running-a-nats-service/configuration/clustering/jetstream_clustering).

The JetStream domain boils down to an extra token inside the `$JS...` topic space, and the presence of this token allows that topic to cross leaf node boundaries. This has a net effect of requiring a lattice administrator to pick which NATS servers/clusters are to be home to the JetStream/JetStream cluster used by wasmCloud.

This is done by modifying the _server configuration_ for the NATS servers that will host the JS domain by setting the `js_domain` configuration value on the NATS server to some well-known value. Then, wasmCloud hosts must have their `WASMCLOUD_JS_DOMAIN` set to this same value. _All other NATS servers not hosting the clustered stream_ must **NOT** use that JetStream domain value.

The following diagram illustrates a sample architecture with leaf nodes all communicating with a central 3-node NATS cluster:

![NATS Leaf Nodes](/docs/images/nats_js_leafs.png)

Anywhere leaf nodes bridge between each other, you can insert [NGS](https://synadia.com/ngs) and seamlessly span two different infrastructures and security domains with NGS providing a "global connective tissue" in between, as shown in the following diagram:

![NATS Leaf Nodes with NGS](/docs/images/nats_js_leafs_ngs.png)

In summary, building on the power of NATS, NATS leaf nodes, and NGS, the wasmCloud lattice can be used to provide seamless, no-discovery-required, automatic-failover connectivity between hosts anywhere in the world on any infrastructure through any number of intervening firewalls without opening any listening ports.
