---
title: "Running a Policy Service"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 3
draft: false
description: "Deploying and Managing a Policy Service"
---

wasmCloud hosts will always enforce a certain level of security by default that _cannot be loosened_. For example, hosts will always validate the JWTs embedded in actor modules and in capability provider archives. These tokens are required and their contents are used to validate whether an actor can communicate with a capability provider, among other things.

If you want to add _**more**_ security to your cluster of wasmCloud hosts, then you can deploy a _policy service_.

To make a policy service, you will need to create code that subscribes to a specific NATS topic (you can choose this topic by supplying it to the [host config](../../hosts/elixir/host_configure)).

Next, your code will need to respond to policy requests that take the following shape in JSON:

```json
{
    "requestId": "... unique ID used for correlation ...",
    "source": {
        "contractId": " ... ",
        "linkName": "default", 
        "issuer": "Nxxx",
        "issuedOn" : "...",
        "expiresAt": 0,
        "expired": false,
    },
    "target": {
        "publicKey": "Vxxx",
        "issuer": "",
        "contractId": "",
        "linkName": "",
    },
    "host": {
        "publicKey": "Nxxx",
        "latticeId": "default",
        "labels": {
            "hostcore.os": "mac",        
        },
        "clusterIssuers": ["Cxxx", "Cxxxy"]
    },  
    "action": "MyContract.OperationName"
}
```

Your policy service can then use the information in this request to decide if the action will be allowed. The response payload (JSON) should take the following shape:

```json
{
    "requestId": " ... request ID from the submission ...",
    "permitted": true,
    "message": "It's an old code sir, but it checks out."
}
```

:::caution
We do not currently have an active example of a policy service. However, that should be changing shortly as we plan on publishing an example policy service implemented as a single wasmCloud actor.
:::
