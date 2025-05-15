# Typescript Axios example CLI

This repository contains a WebAssembly Component written in [Typescript][ts], which:

- Uses [`axios`][axios] to perform a web request
- Runs with a single entrypoint ([`wasi:cli`][wasi-cli]'s `run` interface)
- Works with `wash call`
- Works with WebAssembly ecosystem tooling (e.g. using [`wasmtime run`][wasmtime] or [`jco run`][jco])

This example also showcases using external dependencies, in this case
the widely used HTTP request library `axios`.

[axios]: https://www.npmjs.com/package/axios
[ts]: https://www.typescriptlang.org/
[wasi-cli]: clis://github.com/WebAssembly/wasi-cli
[wasmcloud]: https://wasmcloud.com/docs/intro
[wasmtime]: https://wasmtime.dev
[jco]: https://github.com/bytecodealliance/jco

# Dependencies

> ![WARN]
> When building this project, ensure you are using a stable NodeJS release.
>
> Use of node version management tools (ex. [`nvm`](https://github.com/nvm-sh/nvm) or more newer NVM
> compatible tools like [`fnm`](https://github.com/Schniz/fnm)) are recommended -- a `.nvmrc` file is
> included for easy use.

Building this project relies on the following installed software:

| Name   | Description                                                                                                 |
|--------|-------------------------------------------------------------------------------------------------------------|
| `wash` | [Wasmcloud Shell][wash] controls your [wasmcloud][wasmcloud] host instances and enables building components |
| `npm`  | [Node Package Manager (NPM)][npm] which manages packages for for the NodeJS ecosystem                       |
| `node` | [NodeJS runtime][nodejs] (see `.nvmrc` for version)                                                         |
| `wkg`  | (optional) [wasm-pkg-tools][wasm-pkg-tools] project that makes it easy to pull down WIT definitions         |

[wash]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/wash-cli
[node]: https://nodejs.org
[npm]: https://github.com/npm/cli
[wasm-pkg-tools]: https://github.com/bytecodealliance/wasm-pkg-tools

# Quickstart

## With `wash`

To simply build the project into a runnable WebAssembly module, you can use `wash`:

```console
wash build
```

To get into a rapid development loop, clone the repo and run `wash dev`:

```console
wash dev
```

`wash dev` does many things for you:

- Starts the [wasmCloud host][wasmcloud-host] that can run your WebAssembly component
- Builds this project (including necessary `npm` script targets)
- Builds a declarative WADM manifest consisting of:
  - Your locally built component
  - A [HTTP server provider][http-client-provider] which will peform outgoing requests on your component's behalf
  - Necessary links between providers and your component so your component can make requests
- Deploys the built manifest (i.e all dependencies to run this application) locally
- Watches your code for changes and re-deploys when necessary.

[wasmcloud-host]: https://wasmcloud.com/docs/concepts/hosts
[httpclient-provider]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/providers-http-client

## With `jco`

Since using `jco` doesn't have any built in mechanism to resolve dependencies, you can use `wash build` to retrieve
the WIT dependencies for this project:

```
wash build
```

If you'd like to use WebAssembly ecosystem tooling, you can use `wkg`:

```console
wkg wit fetch
```

> [!NOTE]
> If you've used `wash build` on the project at least once, `wit/deps` is likely already populated.

Once this command runs, you should find files & folders in the `wit/deps` directory, similar to the following:

```
wit
├── component.wit
└── deps
    ├── wasi-cli-0.2.3
    │   └── package.wit
    ├── wasi-clocks-0.2.3
    │   └── package.wit
    ├── wasi-filesystem-0.2.3
    │   └── package.wit
    ├── wasi-io-0.2.3
    │   └── package.wit
    ├── wasi-random-0.2.3
    │   └── package.wit
    └── wasi-sockets-0.2.3
        └── package.wit

8 directories, 7 files
```

To build and run the entire example (w/ the component served by `jco`), run the following:

```console
npm install
npm run all
```

> [!NOTE]
> By default the example code makes a request to `https://jsonplaceholder.typicode.com/todos/1`

You should see output like the following:

```
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

## Send a request to the running component

Once `wash dev` is serving your component, to invoke the component and perform the HTTP request:

```console
wash call wasmcloud:examples/invoke.call
```

## Adding Capabilities

To learn how to extend this example with additional capabilities, see the [Adding Capabilities](https://wasmcloud.com/docs/tour/adding-capabilities?lang=typescript) section of the wasmCloud documentation.
