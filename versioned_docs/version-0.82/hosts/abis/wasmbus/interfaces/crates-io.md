---
title: "Rust crates"
draft: false
---

This document applies to interface crates built from `.smithy` models, and provides some information about how and when source files are updated.

Interface projects contain one or more `.smithy` files, and a `codegen.toml`, which references the paths to the smithy files and to the output directories for the target languages.`codegen.toml` and `.smithy` files are language-agnostic, so they live one directory level above the `rust` folder, which contains `Cargo.toml`, `build.rs`, and the rust `src` folder.

### Publishing to crates.io

If you want to publish an interface crate on crates.io, all the files necessary to generate the code for that library need to be in the published folder, and nothing in the src/ folder may change while the folder is being built on crates.io.

The usual method for dynamic source generation in Rust crates is to create a `build.rs` script, which uses the environment variable `OUT_DIR` (set by rustc to a location deep inside the `target/build/` folder) as the target for the generated file. Unfortunately IDEs and rust-analyzer aren't able to use that folder to find symbols, provide hints, go-to-definition, etc. (Confirmed in June 2021 with visual studio code and clion/intellij) For the best developer experience, we have set up the interface projects to generate code right into the src/ folder, where IDEs can easily find it. To keep the build compatible with crates.io rules, `build.rs` is not published with the crate (by adding it to an `excludes` list in `Cargo.toml`), so all files in the source tree are frozen until the next published crate version.

When building an interface project from source, `rust/build.rs`, `codegen.toml`, and the `*.smithy` model files are present, so the generated interface library will automatically be re-generated as needed if the `.smithy` file is updated. This seems to have the best combination of outcomes: stable interfaces for published releases, dynamic updates for local builds, and full IDE support.

### Smithy model dependencies

If your smithy file depends on others that are not in your source tree, the `codegen.toml` file can refer to the dependencies using the [`url`](./codegen-toml/#from-urls) parameter. These files are downloaded and [cached](./codegen-toml/#caching) locally to support later offline builds.
