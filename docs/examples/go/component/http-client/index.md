# Go HTTP Client

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/http-client) is a
WebAssembly component that calls a random number generator service to get random numbers.

The application...

- Implements a [`wasi:http`][wasi-http]-compliant HTTP handler
- Uses the [`httpserver` provider][httpserver-provider] to serve requests
- Can be declaratively provisioned in a [wasmCloud][wasmCloud] environment

[wasi-http]: https://github.com/WebAssembly/wasi-http
[httpserver-provider]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/provider-http-server
[httpclient-provider]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/provider-http-client
[wasmCloud]: https://wasmcloud.com/docs/intro
[wash]:  https://wasmcloud.com/docs/ecosystem/wash/
[wasm-tools]: https://github.com/bytecodealliance/wasm-tools#installation

## 📦 Dependencies

> [!WARNING]
> Due to incompatibilities introduced in `wasm-tools` v1.226.0, a version of
> `wasm-tools` <= 1.225.0 is **required** for running this example.
>
> You can install `wasm-tools` [v1.225.0 from upstream releases](https://github.com/bytecodealliance/wasm-tools/releases/tag/v1.225.0), or use
> `cargo` ([Rust toolchain](https://doc.rust-lang.org/cargo/getting-started/installation.html)) -- (i.e. `cargo install --locked wasm-tools@1.225.0`)

Before starting, ensure that you have the following installed in addition to the Go (1.23+) toolchain:

- [`tinygo`](https://tinygo.org/getting-started/install/) for compiling Go (always use the latest version)
- [`wasm-tools`](https://github.com/bytecodealliance/wasm-tools#installation) for Go bindings
- [wasmCloud Shell (`wash`)](https://wasmcloud.com/docs/installation) for building and running the components and wasmCloud environment

## 👟 Run the example

Clone the [wasmCloud/go repository](https://github.com/wasmcloud/go): 

```shell
git clone https://github.com/wasmCloud/go.git
```

Change directory to `examples/component/http-client`:

```shell
cd examples/component/http-client
```

In addition to the standard elements of a Go project, the example directory includes the following files and directories:

- `build/`: Target directory for compiled `.wasm` binaries
- `gen/`: Target directory for Go bindings of [interfaces](https://wasmcloud.com/docs/concepts/interfaces)
- `wit/`: Directory for WebAssembly Interface Type (WIT) packages that define interfaces
- `wadm.yaml`: Declarative application manifest
- `wasmcloud.lock`: Automatically generated lockfile for WIT packages
- `wasmcloud.toml`: Configuration file for a wasmCloud application

### Start a local development loop

Run `wash dev` to start a local development loop:

```shell
wash dev
```

The `wash dev` command will:

- Start a local wasmCloud environment
- Build this component
- Deploy your application and all requirements to run the application locally, including...
  - Your locally built component
  - The [HTTP server provider][httpserver-provider], which will receive requests from the outside world
    (on port 8000 by default)
  - The [HTTP client provider][httpclient-provider], which will call a random number generator service
  - Necessary links between providers and your component so your component can handle web traffic
- Watch your code for changes and re-deploy when necessary.

Once the application is deployed, open another terminal tab. To ensure that the application has reached `Deployed` status, you can use `wash app list`:

```shell
wash app list
```

### Send a request

When you send a request, the component will call an upstream API and return a list of random numbers:

```shell
curl localhost:8000
```
```text
[438,424,166,260,681]
```

### Clean up

You can stop the `wash dev` process with `Ctrl-C`.

## ⚠️ Issues/FAQ

### `curl` produces a "failed to invoke" error

If `curl`ing produces...

```text
failed to invoke `wrpc:http/incoming-handler.handle`: failed to invoke `wrpc:http/incoming-handler@0.1.0.handle`: failed to shutdown synchronous parameter channel: not connected%
```

...the HTTP server may not have finished starting up. You can check that the application has reached `Deployed` status with `wash app list`. 

If the issue persists, you may have a lingering HTTP server provider running on your system. You can use `pgrep` to check:

```shell
pgrep -la ghcr_io
```
```text
4007604 /tmp/wasmcloudcache/NBCBQOZPJXTJEZDV2VNY32KGEMTLFVP2XJRZJ5FWEJJOXESJXXR2RO46/ghcr_io_wasmcloud_http_server_0_23_1
```

## 📖 Further reading

For more on building components, see the [Component Developer Guide](https://wasmcloud.com/docs/developer/components/) in the wasmCloud documentation. 
