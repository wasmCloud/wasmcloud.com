# In-Memory Key-Value Storage Provider

[This capability provider example](https://github.com/wasmCloud/go/tree/main/examples/provider/keyvalue-inmemory) implements `wrpc:keyvalue/store@0.2.0-draft` to provide key-value functionality (backed in-memory) for components that **import** the same interface. 

## 👟 Run the Go project

Clone the [wasmCloud/go repository](https://github.com/wasmcloud/go): 

```shell
git clone https://github.com/wasmCloud/go.git
```

Change directory to `examples/provider/keyvalue-inmemory`:

```shell
cd examples/provider/keyvalue-inmemory
```

In addition to the standard elements of a Go project, the example directory includes the following files and directories:

- `/bindings`: An auto-generated directory for Go bindings of [interfaces](https://wasmcloud.com/docs/concepts/interfaces). Users typically will not need to interact directly with the contents of this directory.
- `/wit`: Directory for WebAssembly Interface Type (WIT) packages that define interfaces.
- `wasmcloud.toml`: Configuration file for a wasmCloud application.

The example includes a shell script that simulates what the host does to run the provider, enabling you to test the provider without running a host.

```shell
./run.sh
```

You can also perform each step manually:

```shell
host_data='{"lattice_rpc_url": "0.0.0.0:4222", "lattice_rpc_prefix": "default", "provider_key": "keyvalue-inmemory", "link_name": "default","log_level": "debug"}' 
echo $host_data | base64 | go run ./
```

## 🛠️ Build the provider

Build the provider:

```shell
wash build
```

The build process will generate a `.par.gz` archive file in a new `/build` directory.

## 🩻 Internals

- `main.go` is a simple binary that sets up an errGroup to handle running the provider's primary requirements: executing as a standalone binary based on data received on stdin, handling RPC, and connecting to a wasmCloud lattice.
- `keyvalue.go` implements the required functions to conform to `wasi:keyvalue/store`. If the functions as specified in the `./wit` directory are not implemented, this provider will fail to build.

## 📖 Further reading

For an introduction to capability providers, see the [Providers Overview](https://wasmcloud.com/docs/concepts/providers) in the wasmCloud documentation.

For more on building providers, see the [Provider Developer Guide](https://wasmcloud.com/docs/developer/providers/) in the wasmCloud documentation. 
