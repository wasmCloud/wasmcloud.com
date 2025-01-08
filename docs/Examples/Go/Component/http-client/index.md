# Go HTTP Client

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/http-client) is a
WebAssembly Component compiled using [TinyGo][tinygo], which:

- Implements a [`wasi:http`][wasi-http]-compliant HTTP handler
- Uses the [`httpserver` provider][httpserver-provider] to serve requests
- Calls a random number generator service to get random numbers using [`wasi:http`][wasi-http]
- Can be declaratively provisioned with [`wadm`][wadm]

[wasi-http]: https://github.com/WebAssembly/wasi-http
[httpserver-provider]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/provider-http-server
[httpclient-provider]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/provider-http-client
[wadm]: https://github.com/wasmCloud/wadm
[tinygo]: https://tinygo.org/getting-started/install/
[wash]:  https://wasmcloud.com/docs/ecosystem/wash/
[wasm-tools]: https://github.com/bytecodealliance/wasm-tools#installation

# Dependencies

Before starting, ensure that you have the following installed in addition to the Go toolchain:

- The [TinyGo toolchain][tinygo]
- [`wash`, the WAsmcloud SHell][wash] installed.
- [`wasm-tools`][wasm-tools] for Go bindings

# Quickstart

To get started developing this repository quickly, clone the repo and run `wash dev`:

```console
wash dev
```

`wash dev` does many things for you:

- Starts the [wasmCloud host][wasmcloud-host] that can run your WebAssembly component
- Builds this project
- Builds a declarative WADM manifest consisting of:
  - Your locally built component
  - A [HTTP server provider][httpserver-provider] which will receive requests from the outside world
    (on port 8000 by default)
  - A [HTTP client provider][httpclient-provider] which will call a random number generator service
  - Necessary links between providers and your component so your component can handle web traffic
- Deploys the built manifest (i.e all dependencies to run this application) locally
- Watches your code for changes and re-deploys when necessary.

[wasmcloud-host]: https://wasmcloud.com/docs/concepts/hosts

## Send a request to the running component

Once `wash dev` is serving your component, to send a request to the running component (via the HTTP
server provider). It will call an upstream API and return a list of random numbers:

```console
curl localhost:8000
[438,424,166,260,681]
```

# Issues/ FAQ

<summary>
<description>

## `curl` produces a "failed to invoke" error

</description>

If `curl`ing produces

```
curl localhost:8000
failed to invoke `wrpc:http/incoming-handler.handle`: failed to invoke `wrpc:http/incoming-handler@0.1.0.handle`: failed to shutdown synchronous parameter channel: not connected%
```

You *may* need to just wait a little bit -- the HTTP server takes a second or two to start up.

If the issue *persists*, you *may* have a lingering HTTP server provider running on your system. You
can use `pgrep` to find it:

```console
❯ pgrep -la ghcr_io
4007604 /tmp/wasmcloudcache/NBCBQOZPJXTJEZDV2VNY32KGEMTLFVP2XJRZJ5FWEJJOXESJXXR2RO46/ghcr_io_wasmcloud_http_server_0_23_1
```

</summary>
