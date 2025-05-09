---
title: "Errors"
date: 2025-04-25T11:02:05+06:00
sidebar_position: 8
draft: false
---

# Error handling with custom interfaces and wRPC

During function calls between components or providers over custom interfaces, you may wish to programmatically handle errors that arise at various levels of the stack. 

To enable wasmCloud's opt-in experimental support for custom interface error handling, use the feature flag at runtime:

```shell
rpc-interface
```

Custom interface error handling can capture errors that occur at the wRPC, NATS transport, or wasmCloud validation layer, and enable programmatic responses (for example, retrying the call). 

This feature builds on the `wrpc:rpc/error.error` resource in wRPC. In a custom interface's WIT, you can use the error as defined in the custom WIT interface below, which is excerpted from a [platform-agnostic "Hello world" RPC client component](https://github.com/bytecodealliance/wrpc/tree/main/examples/rust/hello-component-rpc-client):

```wit
package wrpc-examples:hello;

interface handler {
    use wrpc:rpc/error@0.1.0.{error};

    hello: func() -> result<string, error>;
}

world client {
    import handler;
}

world server {
    export handler;
}
```

Now you can wrap function result values in `result<T, wrpc:rpc/error.error>` as in the Rust code from the ["Hello world" example](https://github.com/bytecodealliance/wrpc/tree/main/examples/rust/hello-component-rpc-client):

```rust
mod bindings {
    wit_bindgen::generate!({ generate_all });
}

use bindings::wrpc::rpc;

fn implicit() {
    match bindings::wrpc_examples::hello::handler::hello() {
        Ok(greeting) => println!("implicit call result: {greeting}"),
        Err(err) => eprintln!(
            "failed to invoke `hello` implicitly: {}",
            err.to_debug_string()
        ),
    }
}

fn main() {
    implicit();
}
```

These signatures can be used interchangeably and are fully backwards and forwards compatible. `wrpc:rpc/error.error` is polyfilled by the runtime. For example, if you call a function for which you don't have a link, and it's wrapped with this result type, you will get an error resource instead of a trap.

### Further reading

* As a reference, you may also wish to see the ["Hello world" RPC server example](https://github.com/bytecodealliance/wrpc/tree/main/examples/rust/hello-component-rpc-server) from the wRPC repository.