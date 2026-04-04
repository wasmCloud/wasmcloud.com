# HTTP Server with Hono

This example demonstrates how to use [`hono`](https://hono.dev) with a custom adapter that works with the `wasi:http` interface. The `hono` library is a lightweight and fast web framework for building HTTP servers. See the [hono documentation](https://hono.dev/docs) for more details.

## Quickstart

```bash
wash dev
```

`wash dev` builds the component, starts a local wasmCloud host, deploys an HTTP server on port 8000, and hot-reloads on source changes.

Once running, try the example routes:

```console
curl localhost:8000/api/data
curl localhost:8000/api/config
```

## Overview

### App

This component implements the [`wasi:http/incoming-handler`](https://github.com/WebAssembly/wasi-http) interface, as defined in its WIT (WebAssembly Interface Types) world.

### Adapter

The adapter in [`src/wasmcloud/hono-adapter`](https://github.com/wasmCloud/typescript/tree/main/examples/components/http-server-with-hono/src/wasmcloud/hono-adapter) bridges the gap between the `hono` web framework and the `wasi:http` interface. It converts incoming WASI HTTP requests into standard Web `Request` objects that Hono can process, and then transforms the Hono `Response` back into a WASI-compatible response. This allows you to use Hono's familiar routing and middleware patterns in a Wasm Component, just like you would in a Node.js or edge environment.

**How it works:**

- The adapter exposes a `serve(app: Hono)` function that takes a Hono app and adds a `fetch` event listener onto the global context. `jco componentize-js` supports this (through StarlingMonkey) by automatically adding the necessary imports.
- Any errors in the request handling are caught and a 500 Internal Server Error is returned to the client.

## Logging

Request and response details are logged to stdout via `console.log`, which maps to the wasmCloud host's standard output stream.
