---
title: "Calling the provider from an actor"
date: 2018-12-29T11:02:05+06:00
weight: 9
draft: false
---

It's a fairly easy matter to declare a dependency on the Payments interface crate for a new actor project. However, the difficult question isn't _how_ can an actor utilize this new payments provider, but _why_ and _when_?

There are a couple of different approaches here, with their own pros and cons.

### Wrapping the provider operations (facade)

We could create a new actor called `PaymentsActor` that links to an HTTP server capability provider, offering up a RESTful interface like this:

| URI | Method | Description |
| :--- | :--- | :--- |
| `/methods` | GET | Retrieve payment methods for current user |
| `/auth` | POST | Attempt to authorize a payment |
| `/pay` | POST | Complete a previously authorized payment |

On the surface, this seems like a decent idea. What's wrong with it? The main problem is we haven't actually added any value. Instead, we've just created a proxy (or _facade_ or _pass-through_ depending on which phrase you like most) for the payments provider. This has the net effect of requiring that any consumer of this actor needs to be aware of the authorize-then-pay-with-valid-token order of operations of the payments provider contract.

Put another way, any actor using this "facade" actor would use the exact same abstraction as the payments contract, so why shouldn't business-appropriate actors just use the provider directly?

That's _exactly_ what we think should happen. It can be **very** tempting to create an actor that thinly wraps a capability provider, especially for those of us who migrated up into the cloud by way of microservices, but we should stop and think about our [bounded contexts](https://martinfowler.com/bliki/BoundedContext.html) first.

### Using the provider in the right business context

Let's assume that we're working within our sample ecommerce application. We now have a payments capability provider, and we have decided _not_ to create a corresponding payments actor.

One possible design with a better[^1] abstraction might be defining the business logic in a shopping cart actor to invoke the payments capability provider, in response to some stimulus requesting a "check out" operation.

We could design this actor to respond to an RPC-style operation called "Checkout" that could be invoked directly by another actor in the lattice, or we could expose an HTTP server operation that handles a POST to the `/cart/{cartId}/checkout` URL, or we could use a `wasmcloud:messaging` capability provider to deliver a message from a subscription that triggers the checkout operation.

For the sake of example, let's take a look at what it might look like to respond directly to a checkout operation via actor-to-actor RPC (this is non-compiling psuedocode):

```rust
/// perform checkout operation:
///  - determine total amount based on current order
///  - authorize and complete payment
///  - if successful, return transaction id
async fn checkout(&self, ctx: &Context, order: &Order) -> RpcResult<()> {
    // verify that items are in stock,
    // and apply other validation rules on order
    self.verify_order(order);
    // calculate the order amount and tax
    let payment_request = self.calculate_amount(order);

    // submit request to Payments provider
    let provider = PaymentsSender::new();
    let auth_response = provider.authorize_payment{ctx, payment_request).await?;
    if  !auth_response.success { /* handle not authorized */ }
    // ask Payaments provider to complete the transaction
    let confirmation = provider.complete_payment(ctx, CompletePaymentRequest {
            auth_code: auth_response.auth_code,
            ..Default::default()
        }).await?;
    }
    if !confirmation.success { /* handle payment failed */ }
    Ok(confirmation.txid)
}
```

In the preceding sample, any (authorized) actor could simply perform an actor-to-actor invocation using the shared actor interface in the `commerce` crate to trigger a shopping cart checkout, which in turn makes use of the payment capability provider, all without any actor developer ever having to know how payments are processed in production, and, even better, allowing actor developers to simulate arbitrary payment environments for unit tests, acceptance tests, and feedback loop/REPL experimentation on their workstation.

#### ⚠️  Note
Make sure your actor is signed by adding `wasmcloud:examples:payments` to the CLAIMS declaration in the actor project's Makefile, or your actor(s) will not be authorized to link with or communicate with the provider we wrote.

[^1]: _better_ is of course, subjective. Your needs and mileage may vary.
