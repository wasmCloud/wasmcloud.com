---
title: "wasmbus FFI Functions"
date: 2018-12-29T11:02:05+06:00
weight: 6
draft: false
---
For the curious, here is the exact list of the wasmbus protocol’s functions. The guest always imports from a module called `wasmbus`, and all function names are preceded by two underscores to avoid accidental collisions with other exported functions.

| Function | Owner | Description |
| :-- | :--: | :-- |
| `__console_log` | Host | Guest calls host to log to host’s stdout (if permitted) |
| `__host_call` | Host | Guest calls to request the host perform an operation |
| `__host_response` | Host | Tells the host the pointer address at which to store its response |
| `__host_response_len` | Host | Returns the length of the host’s response |
| `__host_error` | Host | Tells the host the pointer address at which to store its error blob |
| `__host_error_len` | Host | Returns the length of the host error blob |
| `__guest_response` | Host | Called by the guest to set the pointer and length of the guest’s response blob |
| `__guest_error` | Host | Called by the guest to set the pointer and length of the guest’s error blob |
| `__guest_request` | Host | Called by the guest to tell the host the pointer addresses of where to store the request’s operation (string) and request payload (blob) values. |
| `__guest_call` | Guest | Invoked by the host to tell the guest to begin processing a function call. The guest will then retrieve the parameters and set response values via host calls. |
| `__wasmbus_rpc_version` | Guest | Invoked by the host to query the actor module to determine which version of the wasmbus protocol it was built against. Current actors should return the value **1** |

The wasmbus FFI functions are already taken care of for you in the existing libraries that are code generated from our smithy schemas. Built on top of our code generation foundation, we have the wasmCloud [interfaces](https://github.com/wasmcloud/interfaces).
