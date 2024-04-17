---
title: 'Interfaces (Smithy)'
date: 2020-01-19T00:00:00+00:00
icon: 'ti-map' # themify icon pack : https://themify.me/themify-icons
description: 'Guides, reference docs, and tips for defining interfaces and generating libraries.'
type: 'docs'
---

At its core, wasmCloud is a messaging system, and a scalable messaging system needs well-defined API contracts.

Every capability provider has a capability contract - an interface definition - that defines a service and a set of operations it supports. Even [actor-to-actor](/docs/0.82/developer/communication/actor-to-actor-calls) messages, which don't use capability contracts, benefit by well-defined API contracts. In wasmCloud, we define these API contracts in [Smithy](https://awslabs.github.io/smithy/index.html) files.

In this section, you will find documentation on how to define interfaces using smithy IDL files, and use code generation to create libraries from those definitions.

- [Tutorial](/docs/0.82/developer/providers/rust) on creating a new interface project
- [The wasmCloud-smithy guide](./wasmcloud-smithy/): how wasmCloud uses smithy models, with examples
- Configuring the code generator with [`codegen.toml`](./codegen-toml/) files
- How [Code generation](./code-generation/) works, with pointers for customizing it or writing your own code generator
- [Tips](./tips/) for building and debugging smithy models
- [Publishing](./crates-io/) Rust interface libraries to crates.io

For more information about Smithy in general, you can check out the resources below.

## Additional Smithy references and tools

If you'd like to learn more about Smithy in general, try some of these resources:

- [Smithy home page](https://awslabs.github.io/smithy/index.html)
- [IDL spec v1.0](https://awslabs.github.io/smithy/1.0/spec/core/idl.html)
- [ABNF grammar](https://awslabs.github.io/smithy/1.0/spec/core/idl.html#smithy-idl-abnf) (if you want to write your own parser)
- [JSON AST](https://awslabs.github.io/smithy/1.0/spec/core/json-ast.html) - the handlebars-based code generators use this
- [Specifications](https://awslabs.github.io/smithy/1.0/spec/index.html)
- [Visual Studio plugin](https://github.com/awslabs/smithy-vscode) (in the extension marketplace)
- [Rust-atelier](https://github.com/johnstonskj/rust-atelier)
- SDKs
  - Go [github](https://github.com/aws/smithy-go)
  - Java sdk [github](https://github.com/awslabs)
  - Rust [github](https://github.com/awslabs/smithy-rs) (Alpha status)
  - TypeScript [github](https://github.com/awslabs/smithy-typescript)
