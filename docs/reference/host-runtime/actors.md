---
title: "Actors"
date: 2018-12-29T11:02:05+06:00
weight: 4
draft: false
---

An **_actor_** is the smallest unit of deployable, portable compute within the wasmCloud ecosystem. Actors are small WebAssembly modules that can handle messages delivered to them by the host runtime and can invoke functions on [capability providers](./capabilities), provided they have been [granted the appropriate privileges](./security).

### Single-Threaded

_Concurrency is hard_. Even when we get concurrency correct, it's still hard. Building systems that work properly either through multi-threading or through so-called "green threads" or "coroutines" is difficult and error-prone. Concurrency and parallelism introduce friction in writing new code, maintaining old code, troubleshooting, and routinely wreaks havoc on production systems.

Developers want to write business logic without having to worry about the intricate details of the threading model of the surrounding environment. In alignment with [the actor model](https://en.wikipedia.org/wiki/Actor_model), wasmCloud actors are single-threaded _internally_. The surrounding environment provided by the host runtime may have varying levels of concurrency support, or could even have entirely different concurrency models depending on whether it's running in a browser, on a constrained device, or in the cloud. The code we write for actors should be oblivious to these things and, most importantly, _never have to change_ even if the surrounding environment adopts a different concurrency model.

Though we shouldn't have to worry about the surrounding concurrency model, we need to be aware that our single-threaded code can back things up and produce congestion. Therefore, when developing _message handlers_ for actors, we need to embrace the design of performing small amounts of work in a "get in and get out fast" approach: divide the work to be done into the smallest bits possible, and perform each bit as fast as we can. This approach maximizes the benefits of _external concurrency_ while still keeping the code we write blissfully synchronous.

Again, these kinds of patterns occur in all actor systems, not just wasmCloud.

### Reactive

Actors are [reactive](https://en.wikipedia.org/wiki/Reactive_programming). An actor cannot initiate any action on its own, it can simply _react_ to outside stimuli in the form of messages delivered by the host. Actor developers declare which messages their actors handle as input and return messages as output, as shown in the following example that receives a bank account query and responds with the bank account value:

```rust
#[async_trait]
impl BankServer for BankActor {
    async fn handle_inquiry(&self,
        ctx: &Context,
        query: &BalanceInquiry) -> RpcResult<Balance> {

    // queried using another capability provider
    let balance = get_balance()?;
    Ok(Balance{
        account: query.account,
        balance
    })
  }
}
```

While the preceding actor code could communicate with capability providers (e.g. a _key-value store_ to retrieve the account balance), it could only do so in response to a message being delivered from the host.

### Communication by Abstraction

wasmCloud actors are _loosely coupled_ with the capability providers they use for non-functional requirements. An actor doesn't communicate with **Redis** or **Cassandra** or **Consul**, instead it communicates with a generalized abstraction over _key-value stores_. Under the hood, each of these abstractions is represented by a contract or **interface**. As long as the capability provider implements the correct interface contract, it should be considered compatible with your actor. An actor written against the key-value store abstraction should be able to work with _any_ key-value store, and even have that store swapped live at runtime without requiring a rebuild or redeploy.

There are a number of _first-party_ [interfaces](https://github.com/wasmcloud/interfaces) which we maintain in our Github organization. Additionally, the community can build their own public capability providers and enterprises are free to build their own internal, proprietary capability providers that expose private enterprise or corporate functionality.

### Secure

Actors are secure by default. Because actors are WebAssembly modules that cannot use the WASI extensions, these modules are physically incapable of interacting with any operating system functionality on their own. The only way actors can affect their external environment is through the use of a capability provider.

Actors must be explicitly granted access to each capability provider contract (abstraction/interface), otherwise the host runtime will not allow it to make calls to that provider or receive messages from it. Granting access to capabilities is discussed more in the [security](./security) section of the reference, but the short version is that each actor's WebAssembly module contains an embedded JSON Web Token (JWT) that holds claims, including claims attesting with which providers the actor is allowed to communicate.
