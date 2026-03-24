# HTTP Server with Hono

This example demonstrates how to use [`hono`](https://hono.dev) with a custom adapter that works with the `wasi:http` interface. The `hono` library is a lightweight and fast web framework for building HTTP servers. See the [hono documentation](https://hono.dev/docs) for more details.

Additionally, it makes use of the `wasi:logging/logging` to log details about incoming requests and responses with a hono middleware and it uses the `wasi:config/runtime` to pass config from the environment to the hono app as part of the [env key on the request context](https://hono.dev/docs/api/context#env).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:

   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Overview

### App

This component implements the [`wasi:http/incoming-handler`](https://github.com/WebAssembly/wasi-http) interface, as defined in its WIT (WebAssembly Interface Types) world.

### Adapter

The adapter in [`src/wasmcloud/hono-adapter`](https://github.com/wasmCloud/typescript/tree/main/examples/components/http-server-with-hono/src/wasmcloud/hono-adapter) bridges the gap between the `hono` web framework and the `wasi:http` interface. It converts incoming WASI HTTP requests into standard Web `Request` objects that Hono can process, and then transforms the Hono `Response` back into a WASI-compatible response. This allows you to use Hono's familiar routing and middleware patterns in a Wasm Component, just like you would in a Node.js or edge environment.

**How it works:**

- The adapter exposes a `serve(app: Hono)` function that takes a Hono app and adds a 'fetch' event-listener onto the global context. JCO componentize-js supports this (through StarlingMonkey) by automatically adding the necessary imports.
- Any errors in the request handling are caught and a 500 Internal Server Error is returned to the client.

## Logging Middleware

The logging middleware in [`src/wasmcloud/hono-middleware-wasi-logging`](https://github.com/wasmCloud/typescript/tree/main/examples/components/http-server-with-hono/src/wasmcloud/hono-middleware-wasi-logging) provides request and response logging for your Hono app using the `wasi:logging/logging` interface. It logs details about each incoming request and outgoing response, such as method, path, status code, and duration, to the wasmCloud host's log system.

**How it works:**

- Attaches to your Hono app as middleware
- Logs request details before passing to the next handler
- Logs response details (including status and timing) after the handler completes
- Uses the WASI logging interface for compatibility with wasmCloud and other WASI hosts

This makes it easy to observe and debug your HTTP component's behavior in production or development environments.

## Environment Variables

The example uses the `wasi:config/runtime` interface to pass environment variables to the Hono app. The `env` object is available in the request context, allowing you to access configuration values in your routes and middleware.
