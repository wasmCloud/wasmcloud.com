---
title: "Code generation"
draft: false
---

You only need to read this section if you want to customize code generation, write a new target language generator, or if you want to know more about how it works.

## Code generation as code

Code generated from `.smithy` files is driven by a file `codegen.toml`, usually in the project root folder. That file specifies the target languages to generate, where to place the generated files, and includes any flags for customization of the output.

A new-project generator (invoked with [`wash new`](/docs/fundamentals/wash)) copies and transforms files from a template folder, and is configured with `project-generate.toml` in the template folder. Template files are passed through a handlebars template engine. Variables and data used in the templates are pulled from that file and optional additional `.toml` data files.

## Support libraries

We have developed libraries to support two popular styles of code generation. If you are building a code generator for a new target language, you can choose either or both, depending on which model you think fits best for each type of output file.

- **Handlebars-templates**
  - A handlebars template generator in `weld_codegen::renderer` contains several plugins (called "handlebars helpers"), including a few for converting identifiers to various idiomatic case styles. (such as converting from ItemList to itemList or item_list).
- **Visitor pattern**
  - A `Generator` class in `weld_codegen::gen` parses the smithy model and invokes callbacks to generate interface definitions, structures, methods, and data types. Each callback function appends its output to a buffer, which is written to the output file after the entire schema has been processed. A base trait implements common, language-independent, functions, and a rust generator extends the base trait to implement specialize generators for Rust output.

The Rust code generator uses both techniques: the Visitor pattern is used for generating `.rs` files, and the handlebars templates are used for generating `Cargo.toml` and `wasmcloud.toml` files.

There is a documentation generator that turns `.smithy` files into html. It uses the sample code generation libraries, and is invoked by passing `html` as the output language instead of `rust`.

## Adding or replacing templates

Additional templates or replacement templates be specified in codegen.toml. Inside the language section of your project's `codegen.toml`, add a template folder with the key `templates`. For example,

```toml
[html]
# add-to or override default templates
templates = "docgen/templates"
```

```toml
[rust]
# add-to or override default templates
templates = "codegen/templates/rust"
```

## Specifying the name of the starting template

HTML documentation generation (guided by the `[html]` language section of the project codegen.toml) uses a template called `namespace` for the primary html page. Ypu can override the name of the template used by adding `doc_template = "mypage"` to the `[html.parameters]` section.
