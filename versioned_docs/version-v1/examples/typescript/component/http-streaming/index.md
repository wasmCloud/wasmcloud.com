# Typescript HTTP Streaming

This repository contains a HTTP component that performs a streaming response using WASI I/O and HTTP Preview2 primitives, written in [Typescript][ts].

This component:

- Uses [Typescript][ts] for it's implementation
- Uses the [`wasi:http`][wasi-http] and [`wasi:io`][wasi-io] standard WIT definitions
- Relies on the [`httpserver` capability provider][httpserver-provider] (which exposes the [`wasmcloud:httpserver` interface][httpserver-interface])
- Streams bytes in response to all HTTP requests
- Can be declaratively provisioned with [`wadm`][wadm]

[ts]: https://www.typescriptlang.org/
[wasi-http]: https://github.com/WebAssembly/wasi-http
[wasi-io]: https://github.com/WebAssembly/wasi-io
[httpserver-provider]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/providers/http-server
[httpserver-interface]: https://github.com/wasmCloud/interfaces/tree/main/httpserver
[wadm]: https://github.com/wasmCloud/wadm

# Dependencies

> ![WARN]
> When building this project, ensure you are using a stable NodeJS release.
>
> Use of node version management tools (ex. [`nvm`](https://github.com/nvm-sh/nvm) or more newer NVM
> compatible tools like [`fnm`](https://github.com/Schniz/fnm)) are recommended -- a `.nvmrc` file is
> included for easy use.

Building this project relies on the following software:

| Name   | Description                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `wash` | [Wasmcloud Shell][wash] controls your [wasmcloud][wasmcloud] host instances and enables building components (version should be >= 0.39.0) |
| `npm`  | [Node Package Manager (NPM)][npm] which manages packages for for the NodeJS ecosystem                                                     |
| `node` | [NodeJS runtime][nodejs] (see `.nvmrc` for version)                                                                                       |

[wash]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/wash-cli
[node]: https://nodejs.org
[npm]: https://github.com/npm/cli

# Quickstart

To get started developing this repository quickly, clone the repo and run `wash dev`:

```console
wash dev
```

`wash dev` does many things for you:

- Starts the [wasmCloud host][wasmcloud-host] that can run your WebAssembly component
- Builds this project (including necessary `npm` script targets)
- Builds a declarative WADM manifest consisting of:
  - Your locally built component
  - A [HTTP server provider][httpserver-provider] which will receive requests from the outside world (on port 8000 by default)
  - Necessary links between providers and your component so your component can handle web traffic
- Deploys the built manifest (i.e all dependencies to run this application) locally
- Watches your code for changes and re-deploys when necessary.

> [!NOTE]
> To do things more manually, see [`docs/slow-start.md`][slow-start-docs].

[wasmcloud-host]: https://wasmcloud.com/docs/concepts/hosts
[slow-start-docs]: https://github.com/wasmCloud/typescript/blob/main/examples/components/http-streaming/docs/slow-start.md

## Send a request to the running component

Once `wash dev` is serving your component, to send a request to the running component (via the HTTP server provider):

```console
curl localhost:8000
```

## Adding Capabilities

To learn how to extend this example with additional capabilities, see the [Adding Capabilities](https://wasmcloud.com/docs/tour/adding-capabilities?lang=typescript) section of the wasmCloud documentation.
