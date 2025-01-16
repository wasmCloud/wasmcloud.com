# HTTP Key-Value CRUD

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/http-keyvalue-crud) is a WebAssembly component that demonstrates simple CRUD operations (Create, Read, Update, Destroy) with the [`wasi:keyvalue/store`](https://github.com/WebAssembly/wasi-keyvalue) interface. 

## 📦 Dependencies

Before starting, ensure that you have the following installed in addition to the Go (1.23+) toolchain:

- [`tinygo`](https://tinygo.org/getting-started/install/) for compiling Go (always use the latest version)
- [`wasm-tools`](https://github.com/bytecodealliance/wasm-tools#installation) for Go bindings
- [wasmCloud Shell (`wash`)](https://wasmcloud.com/docs/installation) for building and running the components and wasmCloud environment

## 👟 Quickstart

To run this example, clone the [wasmCloud/go repository](https://github.com/wasmcloud/go): 

```shell
git clone https://github.com/wasmCloud/go.git
```

Change directory to `examples/component/http-keyvalue-crud`:

```shell
cd examples/component/http-keyvalue-crud
```

Run `wash dev` to start a local development loop:

```shell
wash dev
```

The `wash dev` command will:

- Start a local wasmCloud environment
- Build this component
- Deploy your application and all dependencies to run the application locally
- Watch your code for changes and re-deploy when necessary.

Once the application is deployed, open another terminal tab.

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
```
{"message":"Deleted key"}
```

Read through the comments in `main.go` for step-by-step explanation of how the example works.

## 📖 Further reading

When running this example with the `wash dev` command, wasmCloud uses its included NATS key-value store to back key-value operations, but the application could use another store like Redis with no change to the Go code. 

You can learn more about capabilities like key-value storage are fulfilled by swappable providers in the [wasmCloud Quickstart](https://wasmcloud.com/docs/tour/hello-world).  