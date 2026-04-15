# Typescript HTTP Streaming

This repository contains an HTTP component that performs a streaming response using WASI I/O and HTTP primitives, written in [TypeScript][ts].

This component:

- Uses [Typescript][ts] for its implementation
- Uses the [`wasi:http`][wasi-http] and [`wasi:io`][wasi-io] standard WIT definitions
- Streams 1MiB of random bytes in response to all HTTP requests

[ts]: https://www.typescriptlang.org/
[wasi-http]: https://github.com/WebAssembly/wasi-http
[wasi-io]: https://github.com/WebAssembly/wasi-io

# Dependencies

> ![WARN]
> When building this project, ensure you are using a stable NodeJS release.
>
> Use of node version management tools (ex. [`nvm`](https://github.com/nvm-sh/nvm) or more newer NVM
> compatible tools like [`fnm`](https://github.com/Schniz/fnm)) are recommended -- a `.nvmrc` file is
> included for easy use.

Building this project relies on the following software:

| Name   | Description                                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `wash` | [Wasm Shell][wash] controls your [wasmCloud][wasmcloud] host instances and enables building components (version >= 2.0)       |
| `npm`  | [Node Package Manager (NPM)][npm] which manages packages for the NodeJS ecosystem                                                  |
| `node` | [NodeJS runtime][nodejs] (see `.nvmrc` for version)                                                                                |

[wash]: https://wasmcloud.com/docs/installation/#install-wash
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
- Deploys an HTTP server on port 8000 and links it to your component
- Watches your code for changes and re-deploys when necessary

[wasmcloud-host]: https://wasmcloud.com/docs/overview/hosts

## Send a request to the running component

Once `wash dev` is serving your component, to send a request to the running component (via the HTTP server provider):

```console
curl localhost:8000
```

## Adding Capabilities

To learn how to extend this example with additional capabilities, see the [TypeScript Language Guide](https://wasmcloud.com/docs/wash/developer-guide/language-support/typescript/) in the wasmCloud documentation.
