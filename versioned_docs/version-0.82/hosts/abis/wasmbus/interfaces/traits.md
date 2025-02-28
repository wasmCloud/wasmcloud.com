---
title: 'Annotation traits'
draft: false
---

<head>
  <meta name="robots" content="noindex">
</head>

The Smithy model defines several types of trait annotations. Some of these affect code generation or documentation generation. This document lists traits used in wasmCloud interfaces and used by the code generator. Some of the traits listed here do not currently influence code generation or system behavior, but we think may be used in the near future.

### @codegenRust

A `@codegenRust` trait contains one or more fields that affect Rust code generation.

| Field           | Type    | Notes          |
| :-------------- | :------ | :------------- |
| noDeriveDefault | Boolean | default: false |
| noDeriveEq      | Boolean | default: false |

Without `@codegenRust` trait, a structure is generated in Rust with the following derive declaration:

```rust
#[derive(Clone,Debug,Default,Eq,PartialEq,Deserialize,Serialize)]
```

If `noDeriveDefault` is `true`, the Rust code generator does not include `Default` in that declaration. You can set this flag if you want to create your own default constructor.

If `noDeriveEq` is `true`, the Rust code generator does not include `Eq` in the `derive` declaration. You may need to use this flag if you want to create your own `Eq` implementation, or if the structure contains data types that do not implement Eq.

**Example**

```
@codegenRust( noDeriveDefault: true )
structure HttpResponse {
    // ...
}
```

The structure `HttpResponse` is generated in the target language, but without an generated default constructor. (A manually-created default constructor sets the response status code to 200)

### @deprecated

The [`@deprecated`](https://awslabs.github.io/smithy/1.0/spec/core/documentation-traits.html#deprecated-trait) trait causes the code generator to generate a deprecated comment for the field or operation. In Rust, this trait generates a `#[deprecated]` annotation, which results in deprecation warnings added to rust documentation.

### @enum

[`@enum`](https://awslabs.github.io/smithy/1.0/spec/core/constraint-traits.html#enum-trait) is a constraint trait that declares that a String field must have a value that is one of the set of declared variants. This trait is not currently enforced, but is on the roadmap.

### @idempotent

The [`@idempotent`](https://awslabs.github.io/smithy/1.0/spec/core/behavior-traits.html#idempotent-trait) trait indicates that the operation is idempotent. Currently, its use is to communicate to api users the intent of the operation, however in the future this may influence code generation or other service properties. For example, a message transport might retry failed messages marked as idempotent.

### @length

[`@length`](https://awslabs.github.io/smithy/1.0/spec/core/constraint-traits.html#length-trait) is a constraint trait that declares that a shape (string, list, map, or blob) should have a minimum and/or maximum length.

### @nonEmptyString

The `@nonEmptyString` trait indicates that a string field is not allowed to be empty.

### @readonly

The [`@readonly`](https://awslabs.github.io/smithy/1.0/spec/core/behavior-traits.html#readonly-trait) trait signals that the operation does not alter the service. Currently, its use is to communicate to api users the intent of the operation, however in the future this may influence code generation or other service properties.

### @required

The [`@required`](https://awslabs.github.io/smithy/1.0/spec/core/constraint-traits.html#required-trait) trait is used to indicate that a field is always included in the structure. If `@required` is not present, the field is optional. In Rust a non-required field's type is surrounded with `Option<>`.

### @sensitive

The [`@sensitive`](https://awslabs.github.io/smithy/1.0/spec/core/documentation-traits.html#sensitive-trait) trait indicates that a field is sensitive, for example, containing a password, a secret key, or a credit card number. Logging tools should not log sensitive fields. UI displays should mask sensitive fields.

### @serialization

Uses the provided name for on-the-wire serialization

**Example**

```
structure Data {
    name: String,

    @serialization("zip")
    zipCode: String,
}
```

A structure is serialized in msgpack as a "map" of key-value pairs, with the keys being the field names. Usually, the field name transmitted is exactly the same as the declared field name, so, the on-the-wire name of the second field above would be "zipCode". However, perhaps there was a client built with an earlier version of the api that used the field name "zip", and we wish to retain binary compatibility with that client. A new client generated from this interface would see a field name "zipCode" (or, in Rust, "zip_code"), but when serialized, the field will be sent as "zip", and the receiver will deserialize the "zip" field and place it in the structure field "zipCode".

Note that the name of a field created by the code generator is _always_ in a format that is idiomatic for the target language. For example, in Rust, field names use snake_case. The field name in generated code is unaffected by the presence or absence of a `@serialization` trait.

### @tags

[`@tags`](https://awslabs.github.io/smithy/1.0/spec/core/documentation-traits.html#tags-trait) provides additional tags that can aid searching through documentation, or support other automated tools

### @unsignedInt

The `@unsignedInt` trait indicates that the integer field is unsigned, and will cause the code generator to generate unsigned data types if the target language has them.

### @wasmbus

`@wasmbus` is a protocol trait that declares that the service is part of the wasmbus messaging protocol.

| Field           | Type    | Notes    |
| :-------------- | :------ | :------- |
| contractId      | String  | required |
| providerReceive | Boolean | optional |
| actorReceive    | Boolean | optional |

**Example**

```
@wasmbus(
    contractId: "wasmcloud:httpclient",
    providerReceive: true )
service HttpClient {
    version: "0.1",
    operations: [ Request ]
}

```

This declaration states that the HttpClient service has the capability contract id `wasmcloud:httpclient`. The contractId declaration is **required** for all service providers. The boolean value `providerReceive` indicates that the direction of messages for this service is from actor to provider. In other words, the capability provider must implement a handler for the Request method. A service may declare `actorReceive: true` if the direction of messages is _to_ an actor (either provider to actor or actor to actor). Some services can declare both `actorReceive` and `providerReceive`. (The default value for both of these fields is `false`, so it is only necessary to include them if their value is `true`.)

These attributes control code generation, so if you can't find the generated method to send a message to your service, doublecheck that the appropriate `actorReceive` and `providerReceive` flags are enabled.
