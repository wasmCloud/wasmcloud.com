---
title: 'Fetch'
date: 2018-12-29T11:02:05+06:00
sidebar_position: 7
draft: false
---

Not all [**WebAssembly Interface Type (WIT)**][wit] interfaces must be created from scratch.
Most applications will depend on only a few (if any) custom interfaces, reusing most important capabilities.

For example, given a WIT world like the following:

```wit
package wasmcloud:hello;

interface greeter {
    /// Function that greets a given user
    greet: func(name: string) -> string;
}

world hello {
  import wasi:logging/logging@0.1.0-draft;
  import wasi:random/random@0.2.2;

  export greeter;
}
```

While the `greet` functionality is unique to our application, `wasi:logging` and `wasi:random` are not.

This means that in addition to being able to define our own interfaces, we must also be able to retrieve
and reuse existing interfaces in our own wasmCloud projects.

[wit]: https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md

## Retrieving remote WIT interfaces with `wash`

[`wash` (the wasmCloud Shell)][wash] can be used to retrieve pre-existing WIT interfaces from other locations,
whether that means standardized WebAssembly Standard Interface (WASI) interfaces (e.g. `wasi:http`, `wasi:keyvalue`, etc) or other custom
interfaces that are hosted at a known registry (including but not limited to OCI registries).

`wash`'s ability to pull remote WIT interfaces is due to it's integration with standard ecosystem tooling --
`wkg`, provided by [the `wasm-pkg-tools` project][wasm-pkg-tools].

`wash` transparently handles fetching adding WIT files to your project as necessary, so for most projects, all you
need is to run `wash build`, with a WIT file (like the one above) placed in your `wit` directory:

```console
wash build
```

If all WIT worlds are known/standardized, `wash` will resolve them automatically (see `wit/deps` afterwards).

If any WIT interfaces *cannot* be resolved, you will receive an error similar to the following:

```
wash build
Failed to update dependencies

Caused by:
    component registry package `custom:pkg` has no release matching version requirement `*`
```

To instruct `wash` on how to find custom interfaces, we can customize our `wasmcloud.toml` to fetch custom
interfaces, which we'll cover more in the next section.

[wasm-pkg-tools]: https://github.com/bytecodealliance/wasm-pkg-tools

### Retreiveing custom WIT interfaces

To fetch a custom interface with `wash`, we must inform `wash` where it can find the WIT interface in question.
WIT interfaces are identified primarily by a namespace and package (`namespace:package`), which important
information in our configuration.

For example for the `wasmcloud:hello` component defined earlier we might introduce a new dependency on a local
WIT in another folder by including a `wasmcloud.toml` like the following:

```toml
name = "greeter"
language = "rust"
type = "component"

[component]
wasm_target = "wasm32-wasip2"

[[registry.pull.sources]]
target = "custom:pkg"
source = "file://relative/path/to/custom/pkg.wit"
```

If our WIT package was available as an OCI artifact (i.e. via `wash wit publish`), we could use it with
a `wasmcloud.toml` like the following:

```toml
name = "greeter"
language = "rust"
type = "component"

[component]
wasm_target = "wasm32-wasip2"

[[registry.pull.sources]]
target = "custom:pkg"
source = "oci://ghcr.io/<org>/<project>/wit"
```

With these lines of configuration, we can point `wash` at the WIT interfaces it needs to use to generate code,
and help us build wasmCloud projects (whether components or providers).

## Further reading

For more information and more examples, see the [configuration reference for WIT dependency pulling][reference-fetch-pull-cfg].

[reference--fetch-pull-cfg]: https://wasmcloud.com/docs/reference/config/#wit-dependency-fetchpull-configuration---registrypull
