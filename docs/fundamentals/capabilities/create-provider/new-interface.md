---
title: "Creating an interface"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 6
draft: false
---

The first thing we're going to need for our _payments service_ sample capability provider is an **interface**. An interface describes the data types that actors and providers exchange, as well as the supported operations that can be invoked, and the relative directions of those operations.

[Contract-driven](https://en.wikipedia.org/wiki/Design_by_contract) design and development (CDD) has been a long-favored technique for developers building microservices and other types of composable systems. Earlier in our documentation we also referred to it as [interface-driven development](/docs/fundamentals/interface_driven_development). Not only does CDD/IDD make our initial design experience easier, but it continues to pay dividends throughout the life cycle of our application.

### Creating a smithy interface

When designing our interface for the payments capability, we need to clearly define the list of operations and data types to be used. Before getting into the code used to do this, let's look at what we think the operation list might be:

- **AuthorizePayment** - Validates that a potential payment transaction can go through. If this succeeds then we should assume it is safe to complete a payment. Payments _cannot_ be completed without getting a validation code (in other words, all payments must be pre-authorized).
- **CompletePayment** - Completes a previously authorized payment. This operation requires the "authorization code" from a successful authorization operation.
- **GetPaymentMethods** - Retrieves an _opaque_ list of payment methods, which is a list of customer-facing method names and the [tokens](https://en.wikipedia.org/wiki/Tokenization_(data_security)) belonging to that payment method. You could think of this list as a previously saved list of payment methods stored in a "wallet". A payment method _token_ is required to authorize and subsequently complete a payment transaction. A customer may have stored multiple tokens in their wallet with familiar labels such as "family credit card", "business account", etc.

Now let's take a look at the data payloads that might be used with these methods. Again, keep in mind that this is an example use case: a real implementation is likely to have far more detail.

#### AuthorizePaymentRequest

The list of fields on the `AuthorizePaymentRequest` message body:

| Field           | Description                                         |
| :-------------- | :-------------------------------------------------- |
| `amount`        | Amount of the transaction, in cents                 |
| `tax`           | Amount of tax applied to this transaction, in cents |
| `paymentMethod` | Token (string) of the payment method to be used     |
| `paymentEntity` | The entity (customer) requesting this payment       |
| `referenceId`   | Opaque Reference ID (e.g. order number)             |

More complex implementations of a payment provider might require additional fields for currency and the exchange rate _at the time of transaction_.

#### AuthorizePaymentResponse

The list of fields returned by the payments provider in response to an authorization request:

| Field        | Description                                                        |
| :----------- | :----------------------------------------------------------------- |
| `success`    | Indicates a successful authorization                               |
| `authCode`   | Optional string containing the transaction ID of the authorization |
| `failReason` | Optional string with reason for rejection                          |

#### CompletePaymentRequest

In response to a successful authorization, a payment can be confirmed (real money withdrawn) using the following message body:

| Field         | Description                                                                                          |
| :------------ | :--------------------------------------------------------------------------------------------------- |
| `authCode`    | Authorization code from previous response                                                            |
| `description` | A description field to be added to the payment summary (e.g., memo field of a credit card statement) |

#### CompletePaymentResponse

The payment capability will return the following message body after processing a payment request:

| Field       | Description                                       |
| :---------- | :------------------------------------------------ |
| `success`   | Whether the transaction was successful            |
| `txid`      | Receipt code / transaction ID                     |
| `timestamp` | Timestamp (ms since epoch GMT) of the transaction |

#### PaymentMethodsList

In response to the empty query, a payments capability provider will return the following message body:

| Field     | Description                                            |
| :-------- | :----------------------------------------------------- |
| `methods` | A map of `string->string` with tokens and descriptions |

### Generating the interfaces

Now that we have logically defined the contract to be shared by the payments-consuming actors and the payments capability provider, let's use some of the available wasmCloud tools to generate the actor interface code.

```shell
wash new interface payments
```

This command creates a new interface project in the subdirectory 'payments'.
Wasmcloud interfaces are defined in the [smithy](https://awslabs.github.io/smithy/) IDL. When changes are made to the `.smithy` file, a code generator generates code for the selected target languages - currently only Rust is supported, and more languages will be supported in the future.

The `wash new interface` command will ask for some information in order to fill in some meta-data in the generated code. First it will ask if you want to generate a `converter-interface` or a `factorial-interface`. The former is for an interface between actors so you would want to choose `factorial-interface` which is between actor and a capability provider. Use UP/DOWN arrow-keys or the j/k keys to select the right one.

Use the following values for the interactive generate prompts:

1. Interface name: `payments`
1. Namespace prefix: `org.wasmcloud.examples`
1. Capability contract name: `wasmcloud:examples:payments`

The final thing to do is to change the name of the package in the generated file `rust/Cargo.toml` to `wasmcloud-examples-payments`.

The `make` command runs the code generator to generate the rust library, and compiles it. The generated library defines function signatures and data structures that will be shared by the Payments capability provider and the actor that calls the provider.

The `payments.smithy` file that we just created in the new project doesn't know about payments yet so delete `payments.smithy` and replace it with this:
(also available in [github](https://github.com/wasmCloud/examples/blob/main/interface/payments/payments.smithy) )

```smithy
// payments.smithy
//
// Sample api for a simple payments provider
//

// Tell the code generator how to reference symbols defined in this namespace
metadata package = [
    {
        namespace: "org.wasmcloud.examples.payments",
        crate: "wasmcloud_examples_payments"
     }
]

namespace org.wasmcloud.examples.payments

use org.wasmcloud.model#wasmbus
use org.wasmcloud.model#U32
use org.wasmcloud.model#U64

@wasmbus(
    contractId: "wasmcloud:examples:payments",
    providerReceive: true )
service Payments {
  version: "0.1",
  operations: [ AuthorizePayment, CompletePayment, GetPaymentMethods ]
}

/// AuthorizePayment - Validates that a potential payment transaction
/// can go through. If this succeeds then we should assume it is safe
/// to complete a payment. Payments _cannot_ be completed without getting
/// a validation code (in other words, all payments have to be pre-authorized).
operation AuthorizePayment {
    input: AuthorizePaymentRequest,
    output: AuthorizePaymentResponse,
}

/// Completes a previously authorized payment.
/// This operation requires the "authorization code" from a successful
/// authorization operation.
operation CompletePayment {
    input: CompletePaymentRequest,
    output: CompletePaymentResponse,
}


/// `GetPaymentMethods` - Retrieves an _opaque_ list of payment methods,
/// which is a list of customer-facing method names and the
/// _[tokens](https://en.wikipedia.org/wiki/Tokenization_(data_security))_
/// belonging to that payment method. You could think of this list as
/// a previously saved list of payment methods stored in a "wallet".
/// A payment method _token_ is required to authorize and subsequently
/// complete a payment transaction. A customer could have previously
/// supplied their credit card and user-friendly labels for those methods
/// like "personal" and "work", etc.
@readonly
operation GetPaymentMethods {
    output: PaymentMethods
}

/// Parameters sent for AuthorizePayment
structure AuthorizePaymentRequest {
    /// Amount of transaction, in cents.
    @required
    amount: U32,

    /// Amount of tax applied to this transaction, in cents
    @required
    tax: U32,

    /// Token of the payment method to be used
    @required
    paymentMethod: String,

    /// The entity (customer) requesting this payment
    @required
    paymentEntity: String,

    /// Opaque Reference ID (e.g. order number)
    @required
    referenceId: String,
}


/// Response to AuthorizePayment
structure AuthorizePaymentResponse {
    /// Indicates a successful authorization
    @required
    success: Boolean,

    /// Optional string containing the tx ID of auth
    authCode: String,

    /// Optional string w/rejection reason
    failReason: String,
}


/// Confirm the payment (e.g., cause the transaction amount
/// to be withdrawn from the payer's account)
structure CompletePaymentRequest {

    /// authorization code from the AuthorizePaymentResponse
    @required
    authCode: String,

    /// An optional description field to be added to the payment summary
    /// (e.g., memo field of a credit card statement) |
    description: String
}

structure CompletePaymentResponse {

    /// True if the payment was successful
    @required
    success: Boolean,


    /// Transaction id issued by Payment provider
    @required
    txid: String,

    /// Timestamp (milliseconds since epoch, UTC)
    @required
    timestamp: U64,
}

/// A PaymentMethod contains a token string and a description
structure PaymentMethod {
    token: String,
    description: String,
}

/// An ordered list of payment methods.
list PaymentMethods {
    member: PaymentMethod
}
```

If you modify this `.smithy` file, there are two useful `wash` commands to check it for errors:

```text
wash lint
wash validate
```

These check the file against a predefined set of rules. The rules will be added to an improved over time.

You can type `make` to generate the code and build the Rust library.

Now that we have a Rust crate that we can use from both our actor and our capability provider, let's move on to the next step: [_Creating a Capability Provider in Rust_](./rust.md).
