# Keyvalue inmemory golang provider

[This provider example](https://github.com/wasmCloud/go/tree/main/examples/provider/keyvalue-inmemory)
is implements `wrpc:keyvalue/store@0.2.0-draft`.

## Notable files

- main.go is a simple binary that sets up an errGroup to handle running the provider's primary requirements: executing as a standaline binary based on data received on stdin, handling RPC and connecting to a wasmCloud lattice.
- keyvalue.go implements the required functions to conform to `wasi:keyvalue/store`. If the functions as specified in the `./wit` directory are not implemented, this provider will fail to build.
