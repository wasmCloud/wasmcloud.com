# TypeScript HTTP Hello World

This repository contains a Hello World HTTP WebAssembly component example, written in [TypeScript][ts].

This component:

- Uses [TypeScript][ts] for its implementation
- Uses the [`wasi:http`][wasi-http] standard WIT definitions
- Returns `"hello from TypeScript"` to all HTTP requests

[ts]: https://www.typescriptlang.org/
[wasi-http]: https://github.com/WebAssembly/wasi-http

# Dependencies

> ![WARN]
> When building this project, ensure you are using a stable NodeJS release.
>
> Use of node version management tools (ex. [`nvm`](https://github.com/nvm-sh/nvm) or more newer NVM
> compatible tools like [`fnm`](https://github.com/Schniz/fnm)) are recommended -- a `.nvmrc` file is
> included for easy use.

Building this project relies on the following software:

| Name   | Description                                                                                                 |
|--------|-------------------------------------------------------------------------------------------------------------|
| `wash` | [Wasm Shell][wash] helps build, develop, and publish WebAssembly components                                 |
| `npm`  | [Node Package Manager (NPM)][npm] manages packages for the NodeJS ecosystem                       |
| `node` | [NodeJS runtime][nodejs] (see `.nvmrc` for version)                                                         |

[wash]: https://github.com/wasmCloud/wash
[node]: https://nodejs.org
[npm]: https://github.com/npm/cli

# Quickstart

To get started developing this repository quickly, clone the repo and run `wash dev`:

```console
wash dev
```

`wash dev` does many things for you:

- Builds this project (including necessary `npm` script targets)
- Runs the component locally, exposing the application at `localhost:8000`
- Watches your code for changes and re-deploys when necessary.

## Send a request to the running component

Once `wash dev` is serving your component, send a request to the running component:

```console
curl localhost:8000
```

## Adding Capabilities

To learn how to extend this example with additional capabilities, see the [Adding Capabilities](https://wasmcloud.com/docs/tour/adding-capabilities?lang=typescript) section of the wasmCloud documentation.
