# Typescript HTTP Password Checker

This repository contains a WebAssembly Component written in [TypeScript][ts], which:

- Implements a [`wasi:http`][wasi-http]-compliant HTTP handler
- Provides an API for checking password strength
- Uses standard WASI interfaces only — no wasmCloud-specific dependencies

This example also demonstrates using JS ecosystem packages in a Wasm component, notably:

- [`valibot`][valibot] (similar to [`zod`][zod] but with better tree-shaking)
- [`check-password-strength`][npm-check-password-strength] (a community project for checking password strength)

[ts]: https://www.typescriptlang.org/
[wasi-http]: https://github.com/WebAssembly/wasi-http
[wasmcloud]: https://wasmcloud.com/docs/
[zod]: https://github.com/colinhacks/zod
[valibot]: https://github.com/fabian-hiller/valibot
[npm-check-password-strength]: https://www.npmjs.com/package/check-password-strength

# Dependencies

> ![WARN]
> When building this project, ensure you are using a stable NodeJS release.
>
> Use of node version management tools (ex. [`nvm`](https://github.com/nvm-sh/nvm) or more newer NVM
> compatible tools like [`fnm`](https://github.com/Schniz/fnm)) are recommended -- a `.nvmrc` file is
> included for easy use.

Building this project relies on the following installed software:

| Name   | Description                                                                                          |
| ------ | ---------------------------------------------------------------------------------------------------- |
| `wash` | [Wasm Shell][wash] controls your [wasmCloud][wasmcloud] host instances and enables building components (version >= 2.0) |
| `npm`  | [Node Package Manager (NPM)][npm] which manages packages for the NodeJS ecosystem                    |
| `node` | [NodeJS runtime][nodejs] (see `.nvmrc` for version)                                                  |

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

[wasmcloud-host]: https://wasmcloud.com/docs/overview/hosts/

## Send a request to the running component

Once `wash dev` is serving your component, to send a request to the running component (via the HTTP server provider):

```console
curl localhost:8000/api/v1/check --data '{"value": "test"}'
```

You should see a JSON response like:

```json
{
  "status": "success",
  "data": {
    "strength": "Too weak",
    "length": 4,
    "contains": ["lowercase"]
  }
}
```

## Adding Capabilities

To learn how to extend this example with additional capabilities, see the [TypeScript Language Guide](https://wasmcloud.com/docs/wash/developer-guide/language-support/typescript/) in the wasmCloud documentation.

# Issues / FAQ

## `curl` produces a connection error

If `curl` fails immediately after starting `wash dev`, the HTTP server may still be initializing. Wait a moment and retry — it typically starts within a few seconds.
