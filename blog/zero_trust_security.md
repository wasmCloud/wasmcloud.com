---
title: "Zero Trust Distributed Computing with WebAssembly and wasmCloud"
image: "/img/zero-trust-b_w.jpg"
date: 2023-02-09T9:00:00-04:00
author: "Kevin Hoffman"
author_profile: "https://www.linkedin.com/in/%F0%9F%A6%80-kevin-hoffman-9252669/"
description: "A look at how WebAssembly supports zero trust computing from the bottom to the top of the stack"
categories: ["webassembly", "wasmcloud", "distsys", "zerotrust", "security"]
draft: false
---

![wasm](/img/zero-trust-b_w.jpg)

I recently gave a talk at CNCF Security Conference North America on the subject of zero trust computing. In this post
I'll provide an overview of the material from that talk, discussing how zero trust computing is supported at the module, 
runtime, capability, and cluster levels.

<!--truncate-->

## Zero Trust Distributed Computing

I thought it might be a good idea to provide a recap and distillation of the material from the conference talk here. As we continue to preach, WebAssembly is far more than just another tool for building applications that run in the browser. We all firmly believe that it is a next-generation enabling technology for the cloud, the edge, and everywhere in between.

## Module Security
At the lowest level of the wasm virtual machine, there are a number of innovative and powerful security measures. WebAssembly code can't be exploited via RCE (Remote Code Execution) that is often enabled through buffer overrun attacks. This comes from the innate inability to form arbitrary pointers to locations in memory for execution. Code and data remain distinct, so you can't fool a wasm VM into executing data. Further, module security prevents you from jumping or branching to a location that didn't exist when the module started. And of course, WebAssembly is entirely sandboxed, so access to host memory from inside the module is forbidden, with communication limited to shared access to a block of isolated linear memory.

## Runtime Security
A WebAssembly module can do _nothing_ that the host runtime does not allow. This ability for the host runtime to make all deny/allow decisions for everything the module attempts to do is yet another layer of powerful security that we typically want in distributed systems but rarely ever find. Even in our current containerized world, our security stance is often limited to monitoring what a container does and reacting after the fact. With WebAssembly, we get to prevent the malicious behavior from ever happening in the first place.

The WASI extension to the specification allows modules to do a few more things that let them pretend to be real applications, like communicate with stdout/stderr, file I/O, etc. Even with this in place, the runtime itself is responsible for making the virtual file system available to the module, and can deny any attempt to utilize any file descriptor (including `stdout`).

## Capability Security
Once we get above the basic runtime level (we also often call this the "engine" level), we have wasmCloud and our ability to securely provide capabilities to actors. With wasmCloud, we use signed JSON Web Tokens ([JWT](https://jwt.io)) embedded directly in the module. This allows us to verify the permissions of a module _offline_ and during network partitions. We don't need to consult a central authority (which could be spoofed or attacked) to determine what an actor can and cannot do.

Actors are signed with capabilities like `HTTP Server` or `Message Subscriber` or `Key Value Store`. These capabilities are abstract contracts, the implementations for which are linked at runtime. You can use mock, test, or lightweight implementations when going through your inner development loop on your workstation and then swap to different implementations in higher environments, all without having to rebuild or redeploy your actors.

Because actors are cryptographically signed, we can also subject actors to policy that evaluates things like the issuer of the module. We can use policies like this to only allow actors from a certain set of trusted issuers.

## Cluster Security
Each host in a wasmCloud cluster generates its own unique identity key, but is also given a _cluster signing key_. This key is used
to sign invocations to actors and providers elsewhere on the cluster. These remote hosts receiving those calls can then verify the issuer of that invocation. Since each host is given a signing key and a list of public keys to trust, the system is resilient to most forms of intrusion. Man-in-the-middle attacks aren't possible because the hash of the invocation bytes are stored inside the sealed and signed invocation. Each host can verify if the invocation came from the entity that claims to have sent it, as well as whether or not that entity is trusted. 

## Summary
In summary, the combination of WebAssembly, secure WebAssembly runtimes, and wasmCloud give us the ability to build distributed systems that adhere to the _defense in depth_ and _zero trust_ mantras without negatively impacting the developer experience.