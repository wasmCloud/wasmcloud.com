# Typescript component bundled with rslib/rsbuild

This repository contains a hello world HTTP component, written in [Typescript][ts].

This component:

- Uses [Typescript][ts] for it's implementation
- Bundles with [rslib][rslib]

[ts]: https://www.typescriptlang.org/
[rslib]: https://lib.rsbuild.dev/

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
| `wash` | [Wasmcloud Shell][wash] controls your [wasmcloud][wasmcloud] host instances and enables building components |
| `npm`  | [Node Package Manager (NPM)][npm] which manages packages for for the NodeJS ecosystem                       |
| `node` | [NodeJS runtime][nodejs] (see `.nvmrc` for version)                                                         |

[wash]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/wash-cli
[node]: https://nodejs.org
[npm]: https://github.com/npm/cli

# Quickstart

To get started developing this repository quickly, clone the repo and run `npm start`:

```console
npm start
```

This results that the output of the `demo.js` script is printed to the console.

# Details

See package.json for the exact commands being run. But what `npm start` does is:
- `npm install` to download all dependencies
- building the component
- transpiling the component so it can be called from javascript
- running the demo.js script

## Bundling

It uses rslib to bundling the javascript together with the dependencies. See the [`rslib.config.rs`](https://github.com/wasmCloud/typescript/blob/main/examples/components/bundled-rsbuild/rslib.config.ts) file in the example folder for more details.
