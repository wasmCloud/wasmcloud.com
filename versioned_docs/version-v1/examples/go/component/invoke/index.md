# Go Component SDK with Custom WIT

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/invoke) is a WebAssembly component that demonstrates how to
use the wasmCloud [Go Component SDK](https://github.com/wasmCloud/go/tree/main/component) in conjunction with your own custom [WIT interfaces](https://wasmcloud.com/docs/concepts/interfaces).

You can find this application's custom interface in `wit/world.wit`:

```wit
interface invoker {
  call: func() -> string;
}
```

## 📦 Dependencies

> [!WARNING]
> Due to incompatibilities introduced in `wasm-tools` v1.226.0, a version of
> `wasm-tools` <= 1.225.0 is **required** for running this example.
>
> You can install `wasm-tools` [v1.225.0 from upstream releases](https://github.com/bytecodealliance/wasm-tools/releases/tag/v1.225.0), or use
> `cargo` (Rust toolchain) if installed to install `1.225.0` -- (i.e. `cargo install --locked wasm-tools@1.225.0`)

Before starting, ensure that you have the following installed in addition to the Go (1.23+) toolchain:

- [`tinygo`](https://tinygo.org/getting-started/install/) for compiling Go (always use the latest version)
- [`wasm-tools`](https://github.com/bytecodealliance/wasm-tools#installation) for Go bindings
- [wasmCloud Shell (`wash`)](https://wasmcloud.com/docs/installation) for building and running the components and wasmCloud environment

## 👟 Run the example

Clone the [wasmCloud/go repository](https://github.com/wasmcloud/go):

```shell
git clone https://github.com/wasmCloud/go.git
```

Change directory to `examples/component/invoke`:

```shell
cd examples/component/invoke
```

In addition to the standard elements of a Go project, the example directory includes the following files and directories:

- `build/`: Target directory for compiled `.wasm` binaries
- `gen/`: Target directory for Go bindings of [interfaces](https://wasmcloud.com/docs/concepts/interfaces)
- `wit/`: Directory for WebAssembly Interface Type (WIT) packages that define interfaces
- `bindings.wadge_test.go`: Automatically generated test bindings
- `wadm.yaml`: Declarative application manifest
- `wasmcloud.lock`: Automatically generated lockfile for WIT packages
- `wasmcloud.toml`: Configuration file for a wasmCloud application

### Build the component

We will build and deploy this example manually, since we will be using the [`wash call` subcommand](https://wasmcloud.com/docs/cli/wash#wash-call) to interact with the application, requiring a stable identity to call. (As you gain experience with wasmCloud, you will likely want to use the [`wash dev` subcommand](https://wasmcloud.com/docs/cli/wash#wash-dev) to automate your development process.)

Build the component:

```shell
wash build
```

### Start a wasmCloud environment

Start a local wasmCloud environment (using the `-d`/`--detached` flag to run in the background):

```shell
wash up -d
```

### Deploy the application

Deploy the component using the application manifest (`wadm.yaml`):

```shell
wash app deploy wadm.yaml
```

To ensure that the application has reached `Deployed` status, you can use `wash app list`:

```shell
wash app list
```

### Invoke the component

Once the application is deployed, you can call the component using the [`wash call` subcommand](https://wasmcloud.com/docs/cli/wash#wash-call), which invokes a function on a component:

```shell
wash call invoke_example-invoker example:invoker/invoker.call
```
```text
Hello from the invoker!
```

### Clean up

You can delete an application from your wasmCloud environment by referring either to its application name (`invoke-example`) or the original application manifest:

```shell
wash app delete wadm.yaml
```

Stop your local wasmCloud environment:

```shell
wash down
```

### Bonus: Calling when running with `wash dev`

When running with `wash dev`, wasmCloud uses a generated ID for the component. If you have `jq` installed,
you can run the following command to call the component:

```bash
wash call "$(wash get inventory -o json | jq -r '.inventories[0].components[0].id')" example:invoker/invoker.call
Hello from the invoker!
```

## 📖 Further reading

For more on custom interfaces, see the [Interface Developer Guide](https://wasmcloud.com/docs/developer/interfaces/creating-an-interface) in the wasmCloud documentation.
