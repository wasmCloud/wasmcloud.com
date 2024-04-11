---
title: 'Create'
date: 2024-04-10T11:02:05+06:00
sidebar_position: 1
draft: false
---

The first step in creating our new provider is to generate a new project from a template.

We provide an example template to generate a capability provider that has scaffolding to implement the `wasmcloud:messaging` interface. This page will walk you through generating this capability provider and then implementing the functionality using [NATS](https://nats.io).

## Generate

First, generate the capability provider project:

```bash
wash new provider --git wasmCloud/wasmCloud --branch example/nats-messaging-provider --subfolder examples/rust/providers/messaging-nats
```

## The messaging interface

This capability provider will _provide_ the functionality for the `wasmcloud:messaging` interface. Interfaces are defined in WebAssembly Interface Type (WIT)&mdash;if you're new to WIT, see the [Interfaces](/docs/1.0/developer/interfaces/creating-an-interface) section for an introduction to WIT, worlds, interfaces, imports and exports, and how all of these concepts tie together.

Let's take a look at the [WIT for this interface](https://github.com/wasmCloud/messaging):

```wit
package wasmcloud:messaging@0.2.0;

// Types common to message broker interactions
interface types {
    // A message sent to or received from a broker
    record broker-message {
        subject: string,
        body: list<u8>,
        reply-to: option<string>,
    }
}

interface handler {
    use types.{broker-message};

    // Callback handled to invoke a function when a message is received from a subscription
    handle-message: func(msg: broker-message) -> result<_, string>;
}

interface consumer {
    use types.{broker-message};

    // Perform a request operation on a subject
    request: func(subject: string, body: list<u8>, timeout-ms: u32) -> result<broker-message, string>;
    // Publish a message to a subject without awaiting a response
    publish: func(msg: broker-message) -> result<_, string>;
}
```

This interface defines two interfaces, `handler` and `consumer`, in order to give a component the ability to send and receive messages. In a nutshell, this is a pubsub messaging capability.

## Implementing the interface

This capability provider uses `wasmcloud:messaging` and `import`s the `handler` interface and `export`s the `consumer` interface. Take a look at the wit under `wit/provider.wit` for this provider:

```wit
package wasmcloud:provider-messaging-nats;

world provider-messaging-nats {
    import wasmcloud:messaging/handler@0.2.0;
    export wasmcloud:messaging/consumer@0.2.0;
}
```

For each `import` in the provider's `world`, you'll use an external trigger in order to invoke that function on a WebAssembly component dynamically at runtime. Here we import the `handler` interface, and we're going to invoke a [linked](/docs/1.0/concepts/runtime-linking) component any time we receive a message on a NATS subscription.

For each `export` in the provider's `world`, you'll need to implement a function to handle the functionality of that interface. WebAssembly components will be able to invoke exported functions dynamically at runtime. Here, we export the entire `consumer` interface, so we'll need to implement the `publish` and `request` functionality in the provider.

## Implementing imports

As mentioned above, an import is a function that a provider will invoke on a WebAssembly component. We can start with the `wasmcloud:messaging/handler.handle-message` import and, by the end of this section, we'll be invoking a component in response to a NATS message.

<!-- At this point we've decided on a logical contract for components and providers to use for the messaging service. We created a (mostly) code-generated interface crate that can be declared as a dependency by both provider and component, and we created a dummy implementation of the messaging service.

Next we'll write a component that communicates with any messaging provider, regardless of whether it's our implementation or not. -->
