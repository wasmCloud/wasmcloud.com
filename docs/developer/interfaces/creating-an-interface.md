---
title: 'Create'
date: 2018-12-29T11:02:05+06:00
sidebar_position: 6
draft: false
---

[**WebAssembly Interface Type (WIT)**](https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md) is a high-level interface description language (IDL) maintained as an open standard by the W3C WebAssembly Community Group.

In addition to supporting community-standard interfaces written in WIT like those in [WebAssembly System Interface 0.2](https://github.com/WebAssembly/WASI/blob/main/preview2/README.md), wasmCloud enables you to build custom WIT interfaces and communicate between components in the way best-suited to your requirements.

You can find full documentation for WIT in the [community documentation for the Component Model](https://component-model.bytecodealliance.org/design/wit.html). On this page, we will explore how to write an interface in WIT in the context of a wasmCloud application.

## How WIT works

Writing WIT does not enact application behavior itself&mdash;instead, it defines a _contract_ between components, a behavior that a component will either fulfill itself or expect another component to fulfill.

When developing an interface, you can use WIT to define the interfaces through which components and providers will communicate. Specifically, your WIT will define the interfaces through which your component exposes functions **("exports")** and the capabilities that it requires **("imports")**.

When a component adds an import&mdash;for `blobstore` functionality, say&mdash;you can imagine that your component is putting out an open call for _someone_ to perform the very specific, tightly-defined job of providing blob storage. Your component isn't going to worry about who does the job or exactly _how_ they do it, so long as it conforms to the precise definition of work your component has set out.

It is useful to read through existing interfaces written in WIT, such as [those in WASI 0.2](https://github.com/WebAssembly/WASI/blob/main/preview2/README.md), to see how they define contracts. When we set out to write our own interfaces, we'll follow the same patterns to set down a shared language that components can use to describe what they need and what they provide.

## WIT structure and worlds

At bottom, WIT definitions are `.wit` files organized into subdirectories. When you're working with wasmCloud projects, all WIT definitions are found in the `wit` directory at the project root.

WIT files define _interfaces_ and _worlds_:

- **Interfaces** are exactly what you would expect&mdash;named groups of _types_ and _functions_ making up an API.
- **Worlds** are sets of imports and exports.

In a wasmCloud component project, it is conventional to include a top-level WIT world at the root of a `wit` folder in the project directory. This file defines the overall imports and exports for your component. A `world.wit` file might look like this:

```wit
package wasmcloud:hello;

world hello {
  import wasi:logging/logging;

  export wasi:http/incoming-handler@0.2.0;
}
```

This component's WIT world _imports_ logging functionality from another component using the `logging` interface and _exports_ handler behavior to an HTTP server using the `incoming-handler` interface.

The top-level WIT world refers to **WIT dependencies** that are included in the `wit/deps` subdirectory. The dependencies are fetched on demand when running `wash build` or using `wash wit deps`. While the world above only explicitly uses `logging` and `http`, those interfaces can themselves depend on other interfaces. In `deps` for the example component above we find directories for a variety of interfaces:

```shell
├── wasi-cli-0.2.0
├── wasi-clocks-0.2.0
├── wasi-http-0.2.0
├── wasi-io-0.2.0
├── wasi-random-0.2.0
├── wasi-logging-0.1.0-draft
```

If we look inside the `wasi-http-0.2.0` directory, we'll find a single `package.wit` file If you look inside, you'll find a world called `proxy` while `types` is an interface describing types and `handler` is a pair of interfaces.

The `proxy` world describes the imports and exports for `http`. Imports include dependencies from other interfaces such as random number generation; the export is `incoming-handler`.

The `incoming-handler` interface in the `handler` WIT looks like this:

```wit
/// This interface defines a handler of incoming HTTP Requests. It should
/// be exported by components which can respond to HTTP Requests.
interface incoming-handler {
  use types.{incoming-request, response-outparam};

  /// This function is invoked with an incoming HTTP Request, and a resource
  /// `response-outparam` which provides the capability to reply with an HTTP
  /// Response. The response is sent by calling the `response-outparam.set`
  /// method, which allows execution to continue after the response has been
  /// sent. This enables both streaming to the response body, and performing other
  /// work.
  ///
  /// The implementor of this function must write a response to the
  /// `response-outparam` before returning, or else the caller will respond
  /// with an error on its behalf.
  handle: func(
    request: incoming-request,
    response-out: response-outparam
  );
}
```

Note the following features:

- Documentation is denoted by three forward-slashes.
- The interface is named and then defined within braces.
- The interface uses types defined in `interface types` in the `package.wit` file.
- `handle` is described as a function that takes two arguments, a `request` and a `response-out` of the types used above.

## Data types

WIT uses the following built-in data types:

- Boolean values (`bool`)
- Signed integers (`s8`, `s16`, `s32`, `s64`)
- Unsigned integers (`u8`, `u16`, `u32`, `u64`)
- Floating-point numbers (`f32`, `f64`)
- Unicode characters (`char`)
- Unicode strings (`string`)
- Lists (`list`)
- Options (`option`)
- Results (`result`)
- Tuples (`tuple`)

wasmCloud supports **all standard data types** in custom WIT interfaces. For more information on using these types, as well as user-defined types, see the [WIT documentation](https://component-model.bytecodealliance.org/design/wit.html).

:::warning[Warning]
**Streams** and **futures** will not work in a distributed way in custom interfaces, so exercise caution when using these types. However, for better efficiency, some common WASI interfaces have a wRPC equivalent that adapts well-known resources from `wasi-http`, `wasi-keyvalue`, `wasi-messaging`, and `wasi-blobstore` into concrete types that we can send efficiently over the lattice.
:::

## Functions

Functions are defined by a name and the function type `func`, with a colon separating the name and type. After the `func` type, parameters are included within parentheses, and the function is closed with a semicolon. A function with no parameters might look like this:

```wit
idle: func();
```

Functions can be defined in interfaces and as imports or exports in worlds.

Let's take a look at the `handle` function again:

```wit
handle: func(
    request: incoming-request,
    response-out: response-outparam
  );
```

Within the `handle` function, the two parameters `request` and `response-out` are named and then specified as being of the `incoming-request` and `response-outparam` types respectively.

To indicate that a function returns a value, include an arrow symbol after the parentheses and the type of the returned value:

```wit
shout: func() -> string;
```

If a function has multiple return values, the values must be named.

## Example: Greeter

Let's create a very simple interface called `greeter` that passes a string between components. Create a directory called `greeter` and inside that directory a file called `greeter.wit`. Add the following to the file:

```wit
package local:greeter-demo; // <namespace>:<package>

interface greet { // interface <name of interface>
  greet: func(message: string) -> string; // a function named "greet"
}

world greeter {
  export greet; // make the `greet` function available to other components/the runtime
}
```

This interface will take one string parameter called `message` and return a string value.

To add this interface to a component, add the following section to your `wasmcloud.toml` file:

```toml
[overrides]
"local:greeter-demo" = { path = "<path to the greeter directory>" }
```

Then, inside of your component's `world.wit` file, add the following:

```wit
package wasmcloud:hello;

world hello {
  export local:greeter-demo/greet; // [!code ++]
}
```

You can then fetch dependencies with `wash wit deps` (or automatically with `wash build`). If you `ls wit/deps` you'll see a directory containing your custom interface.

Congratulations&mdash;you've written a simple custom interface and added it to a component. For more details on implementing custom interfaces with components and providers, see the [Provider section of the Developer Guide](/docs/developer/providers/).

## Sharing your interface

Sometimes you may want to share your interface for others to consume. `wash` integrates with the [common Wasm registry tooling](https://github.com/bytecodealliance/wasm-pkg-tools) to make this easy.

When writing your interface, it is recommended to store your interface in a subdirectory of your project called `wit`. This is the expected default location for WIT files. It is not required to use this subdirectory, but you'll have to manually specify the directory for some of the commands below. You can break apart your interfaces into multiple `.wit` files in the `wit` directory depending on your preferences, but at least one file has to have a `package` declaration. If you are sharing an interface with others you _MUST_ have a [semver](https://semver.org/) compatible version in the `package` declaration (e.g. `package mynamespace:package-name@0.0.1`).

### Building and publishing

WIT interfaces are shared via a binary format called a "wit package." This is just WIT encoded as a Wasm binary. For convenience, we have a `wash wit` subcommand that is useful for building WIT packages. If you have followed the conventional `wit` directory structure, you can build a WIT package with the following command:

```shell
wash wit build
```

By default this will output a file with the same name as your package with a `.wasm` extension. See the help documentation for `wash wit build` for other options for selecting a different directory or file name. By default, `wash wit build` will not output any dependencies to the `wit/deps` directory. If you need the dependencies available locally (for debugging or generating documentation), run `wash wit deps` to fetch the dependencies and output them to the `wit/deps` directory.

Once you have built your WIT package, you can publish it to a registry. The `wash` CLI has a `wash wit publish` command that will publish your package to a registry. For this to work properly, you will need to have a valid config file for the Wasm package tooling. Please see the [Dependencies documentation](../components/build.mdx#interface-dependencies-and-wash-build) for more information.

## Further reading

For more on WIT, see the [community documentation for the Component Model](https://component-model.bytecodealliance.org/design/wit.html). You may also wish to read the [full specification for WIT on GitHub](https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md).
