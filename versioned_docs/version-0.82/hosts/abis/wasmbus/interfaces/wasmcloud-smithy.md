---
title: 'wasmCloud Smithy'
draft: false
---

# wasmCloud-smithy guide

wasmCloud's use of Smithy closely follows the [Smithy IDL specification](https://awslabs.github.io/smithy/1.0/spec/core/idl.html). This document is intended to be a quick reference to the major features of Smithy, and includes some conventions that wasmCloud has adopted for smithy-defined interfaces.

**Contents**

- [Models](#models)
- [Data types](#data-types)
- [Structures](#structures)
- [Services](#services)
- [Operations](#operations)
- [Documentation](#documentation)

There is also an [index](./traits/) of all annotations used by wasmCloud in `.smithy` files.

## Models

We author models in Smithy IDL files, with a `.smithy` extension. An IDL that defines any shapes must have a namespace declaration,

A [Semantic Model](https://awslabs.github.io/smithy/1.0/spec/core/model.html#the-semantic-model) is built from one or more IDL files and/or json (AST model) files, and can contain multiple namespaces. To fully lint or validate a model, or to generate code from a semantic model, you need to specify paths to all dependencies in all namespaces used by the model. These dependencies are specified in a [`codegen.toml`](./codegen-toml/) configuration file, usually located in the project root folder.

## Data Types

In Smithy, data types are called [shapes](https://awslabs.github.io/smithy/1.0/spec/core/model.html#shapes).

### Supported Shapes

- simple shapes

  - `Byte`, `Short`, `Integer`, `Long`
  - `Float`, `Double`
  - `Boolean`
  - `String`
  - `Blob`
  - `Timestamp` (\* partially supported, see below)

- aggregate shaptes
  - `list` [List](https://awslabs.github.io/smithy/1.0/spec/core/model.html#list) (array of any other type)
  - `set` [Set](https://awslabs.github.io/smithy/1.0/spec/core/model.html#set) (set of unique values)
  - `map` [Map](https://awslabs.github.io/smithy/1.0/spec/core/model.html#map) map of key-type to value-type)
  - `structure` [Structure](https://awslabs.github.io/smithy/1.0/spec/core/model.html#structure)
  - `service` [Service](https://awslabs.github.io/smithy/1.0/spec/core/model.html#service) a collection of operations
  - `operation` [Operation](https://awslabs.github.io/smithy/1.0/spec/core/model.html#operation) a function

The following Smithy shapes are **partially supported**: `set`, `Timestamp`

The following Smithy shapes are **not supported** (yet): `BigInteger`, `BigDecimal`, `union`, `document`. `resource`

### Integer types

Smithy's primitive integer types (Byte, Short, Integer, Long) are signed.
The namespace `org.wasmcloud.model` defines unsigned types: (`U8`,`U16`,`U32`,`U64`)
and, for consistency, aliases (`I8`,`I16`,`I32`,`I64`) for the signed primitive types.
The unsigned types have the trait `@unsignedInt`, which has the trait `@limit(min:0)`.

The `@unsignedInt` trait causes the code generator to generate unsigned data types in languages that support them.

### Timestamp

Timestamp is currently supported only in Rust, but will be added to all supported output languages. A timestamp is represented approximately like this:

```rust
struct Timestamp {
  sec: u64,   // seconds since unix epoch in UTC (also called unix time)
  nsec: u32,  // nanoseconds since the beginning of the last whole second
}
```

SDK Client libraries in supported languages will include functions for converting between a Timestamp and RFC3339 strings.

### Maps

Due to the way we use msgpack, map key types are limited to String.

## Structures

Structures are just like the structures in your favorite programming languages.

```
/// Documentation for my structure
structure Point {
    x: Integer,
    y: Integer,
}
```

### Optional and Required fields

Most structure members are optional by default.

The [`@box` trait ](https://awslabs.github.io/smithy/1.0/spec/core/type-refinement-traits.html#box-trait) for a structure member means that it is not required to be present, and there is no default value. A boxed structure member would be emitted in Rust code with an `Option<>` wrapper.

The types boolean, byte, short, integer, long, float, and double types are not boxed unless they have an explicit `@box` annotation, in other words, without `@box` these types are required. All other types (string, list, map, structure, etc.) are implicitly boxed and without annotation would be optional.

The `@required` trait may be used on structure members to indicate that it must be present.

## Services

A Service defines a set of operations. wasmCloud has defined a set of required and optional annotations for services and their operations.

The `@wasmbus` annotation is required. `wasmbus` is the name wasmCloud uses for its messaging protocol.

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

## Operations

Operations represent functions, and are declared with 0 or 1 input types (parameters)
and 0 or 1 output types (return values).

```
/// Increment the value of the counter, returning its new value
operation Increment {
    input: I32,
    output: I32,
}
```

Operation input and output types can be any supported data type,
other than optional types.
An operation with no input declaration means the operation takes no parameters,
for example,

```
operation GetTimeOfDay {
    output: Timestamp
}
```

An operation without output means the operation has no return value
(e.g., returns 'void'), for example,

```
operation SetCounter {
    input: U64,
}
```

Input and output types cannot be optional. If you need to model a function
such as `fn lookup(key: String) -> Option<String>` or
`func resetCounter( value: number | null )` , you'll need to use a structure
with an optional field.

## Multiple parameters

We would like to model functions that take multiple parameters. We can do that with Smithy by creating a wrapper structure for the multiple args.

For example, a key value store might have a "set" operation:

```
Set(key: string, value: string, expires: i32): SetResponse
```

Since Smithy operations can only be declared with a single input type, the Smithy declaration might look like

```
operation Set {
  input: SetRequest,
  output: SetResponse,
}
structure SetRequest {
   @required
   key: String,
   @required
   value: String,
   @required
   expires: I32,
}
structure SetResponse {
   // ...
}
```

This is somewhat more verbose than we'd like it to be. In the future we would like to add an annotation to the structure to tell the code generator to "flatten" the structure into multiple input parameters when generating the function signature. This would not change the format of the data on-the-wire, so such a change would not impact binary compatibility, but it would

## Documentation

Documentation for shapes is indicated by preceding the shape declaration with one or more lines of comments beginning with three slashes (`/// Comment`). All comments of this type are emitted by code and documentation generators, (The same effect can be achieved by using the `@documentation` annotation trait). In Smithy, documentation on consecutive lines is combined into a single block, and interpreted as **CommonMark markdown**. At the moment, html generated by the documentation generator does not perform markdown-to-html conversion, so documentation appears as it does in the source file. If the generated file is Rust source code, the Rust doc generator _does_ convert markdown in comments, so for Rust code, markdown in the smithy comments can result in formatted comments in Rust docs.
