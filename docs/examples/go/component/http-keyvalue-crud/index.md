# Go HTTP Key-Value CRUD

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/http-keyvalue-crud) is a WebAssembly component that demonstrates simple CRUD operations (Create, Read, Update, Destroy) with the [`wasi:keyvalue/store`](https://github.com/WebAssembly/wasi-keyvalue) interface. 

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

Change directory to `examples/component/http-keyvalue-crud`:

```shell
cd examples/component/http-keyvalue-crud
```

In addition to the standard elements of a Go project, the example directory includes the following files and directories:

- `/build`: Target directory for compiled `.wasm` binaries
- `/gen`: Target directory for Go bindings of [interfaces](https://wasmcloud.com/docs/concepts/interfaces)
- `/wit`: Directory for WebAssembly Interface Type (WIT) packages that define interfaces
- `bindings.wadge.go`: Automatically generated test bindings
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
- Deploy your application and all dependencies to run the application locally
- Watch your code for changes and re-deploy when necessary.

Once the application is deployed, open another terminal tab. To ensure that the application is deployed, you can use `wash app list`:

```shell
wash app list
```

### Send a request

The user provides keys as query strings and values as JSON payloads, with the application performing CRUD operations according to the HTTP method of the request.

To **Create** (or **Update**) a value:

```shell
curl -X POST localhost:8000/crud/key -d '{"foo": "bar", "woo": "hoo"}'
```
```text
{"message":"Set key", "value":"{"foo": "bar", "woo": "hoo"}"}
```

To **Read** a value:

```shell
curl localhost:8000/crud/key
```
```text
{"message":"Got key", "value":"{"foo": "bar", "woo": "hoo"}"}
```

To **Destroy** a value:

```shell
curl -X DELETE localhost:8000/crud/key
```
```text
{"message":"Deleted key"}
```

Read through the comments in `main.go` for step-by-step explanation of how the example works.

### Clean up

You can stop the `wash dev` process with `Ctrl-C`.

## 📖 Further reading

When running this example with the `wash dev` command, wasmCloud uses its included NATS key-value store to back key-value operations, but the application could use another store like Redis with no change to the Go code. 

You can learn more about capabilities like key-value storage are fulfilled by swappable providers in the [wasmCloud Quickstart](https://wasmcloud.com/docs/tour/hello-world).  