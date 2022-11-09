---
title: "The wasmbus Protocol"
date: 2018-12-29T11:02:05+06:00
weight: 6
draft: false
---

wasmbus has a few core requirements. The first is that the protocol must never expose the internal allocation strategy of either side of the conversation. This allows that same allocation strategy to change over time without requiring a rebuild and redeploy of any WebAssembly modules.

The second requirement is that the protocol is effectively _stateless_. This means that state such as guest responses and error blobs and host responses and host error blobs will be maintained throughout the lifetime of _one host-initiated function call_, but all state should be considered wiped/discarded after the completion of that root call.

This guarantees that a WebAssembly module can crash after a function and be reloaded from scratch prior to the next function call without delivering corrupt or missing answers to the callers. When we build a protocol with this requirement, it behaves quite nicely in the cloud where we might be disposing of, relocating, and reloading WebAssembly modules on hundreds of distributed hosts at any given time.

The function call flow always starts with the host. wasmbus is a _reactive_ function protocol in that guests cannot initiate host calls unless the guest was itself triggered by a host.

wasmbus calls involve two basic pieces of data:

- An **operation name** - that is a string composed of a service name, a dot, and a method name , e.g. `HttpServer.HandleRequest` or `Calculator.PerformAddition`.
- The raw binary payload containing the operation’s parameters. wasmbus does not enforce any particular serialization mechanisms - the payload and responses always remain opaque blobs.

The logical flow is as follows (with a few details left out for simplicity’s sake):

1. The host initiates a function call exchange with the guest by invoking the “guest call” export. This export takes two parameters: the length of the operation name, and the size in bytes of the binary payload.
1. The guest internally allocates two buffers (again, the host remains oblivious to how and when this happens) and then tells the host the linear memory address offsets of the two buffers for the **operation name** and **payload** via the “guest request” function.
1. In response to the “guest request” function call, the host loads the request data for the call into linear memory at the locations indicated by the given pointers.
1. The guest module then performs the main body of its logic. This is where your guest's "function body" runs.
1. Optionally the guest module can then make requests of the host via the “host call” function. The host call function accepts many parameters, including the pointer and byte length of the **operation name**, **payload** (message body), and **namespace** (used for optional disambiguation between operations). wasmCloud uses the namespace field for the binding [link](/docs/reference/host-runtime/links) name (e.g. "default" or "cache" etc)
1. The guest either informs the host where to find a response via the “guest response” function or it informs the host where to find an error via “guest error”.
1. The guest function returns 0 for failure, 1 for success. Note that success cannot be confused with default values.
1. The host inspects the numeric return value, and then retrieves either the success bytes or failure bytes accordingly. The failure bytes can be used by higher-level projects to return robust error structures.
