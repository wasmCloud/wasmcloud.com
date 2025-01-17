# Go HTTP Password Checker

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/http-password-checker) is a WebAssembly component that checks password strength over HTTP. 

The application...

- Implements a [`wasi:http`][wasi-http]-compliant HTTP handler
- Uses the [`httpserver` provider][httpserver-provider] to serve requests
- Can be declaratively provisioned in a [wasmCloud][wasmCloud] environment

[wasi-http]: https://github.com/WebAssembly/wasi-http
[httpserver-provider]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/provider-http-server
[wasmCloud]: https://wasmcloud.com/docs/intro
[tinygo]: https://tinygo.org/getting-started/install/
[wash]:  https://wasmcloud.com/docs/ecosystem/wash/
[wasm-tools]: https://github.com/bytecodealliance/wasm-tools#installation

## 📦 Dependencies

Before starting, ensure that you have the following installed in addition to the Go (1.23+) toolchain:

- [`tinygo`](https://tinygo.org/getting-started/install/) for compiling Go (always use the latest version)
- [`wasm-tools`](https://github.com/bytecodealliance/wasm-tools#installation) for Go bindings
- [wasmCloud Shell (`wash`)](https://wasmcloud.com/docs/installation) for building and running the components and wasmCloud environment

## 👟 Run the example

Clone the [wasmCloud/go repository](https://github.com/wasmcloud/go): 

```shell
git clone https://github.com/wasmCloud/go.git
```

Change directory to `examples/component/http-password-checker`:

```shell
cd examples/component/http-password-checker
```

In addition to the standard elements of a Go project, the example directory includes the following files and directories:

- `build/`: Target directory for compiled `.wasm` binaries
- `gen/`: Target directory for Go bindings of [interfaces](https://wasmcloud.com/docs/concepts/interfaces)
- `wit/`: Directory for WebAssembly Interface Type (WIT) packages that define interfaces
- `bindings.wadge_test.go`: Automatically generated test bindings
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
  - The [HTTP server provider][httpserver-provider], which will receive requests from the outside world (on port 8000 by default)
  - Necessary links between providers and your component so your component can handle web traffic
- Watch your code for changes and re-deploy when necessary.

Once the application is deployed, open another terminal tab. To ensure that the application has reached `Deployed` status, you can use `wash app list`:

```shell
wash app list
```

### Send a request

You can send a request with a JSON payload to the `/api/v1/check` endpoint:

```shell
curl localhost:8000/api/v1/check -d '{"value": "tes12345!"}'
```
```json
{
    "valid": false, "message": "insecure password, try including more special characters, using uppercase letters or using a longer password"
}
```

### Clean up

You can cancel the `wash dev` process with `Ctrl-C`.

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

To learn how to extend this example with additional capabilities, see the [Adding Capabilities](https://wasmcloud.com/docs/tour/adding-capabilities?lang=go) section of the wasmCloud documentation.

For more on building components, see the [Component Developer Guide](https://wasmcloud.com/docs/developer/components/) in the wasmCloud documentation. 