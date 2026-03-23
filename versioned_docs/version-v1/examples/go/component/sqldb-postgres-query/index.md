# Go SQLDB Postgres 🐘

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/sqldb-postgres-query) is a WebAssembly component that can query a PostgresDB database.

The application...

- Implements the [`wasmcloud:postgres` WIT contract](https://github.com/wasmCloud/wasmCloud/tree/main/wit/postgres)
- Uses the [`sqldb-postgres-provider`](https://github.com/wasmCloud/wasmCloud/tree/main/crates/provider-sqldb-postgres)
  capability provider
- Can be declaratively provisioned in a [wasmCloud][wasmCloud] environment

## 📦 Dependencies

> [!WARNING]
> Due to incompatibilities introduced in `wasm-tools` v1.226.0, a version of
> `wasm-tools` <= 1.225.0 is **required** for running this example.
>
> You can install `wasm-tools` [v1.225.0 from upstream releases](https://github.com/bytecodealliance/wasm-tools/releases/tag/v1.225.0), or use
> `cargo` ([Rust toolchain](https://doc.rust-lang.org/cargo/getting-started/installation.html)) -- (i.e. `cargo install --locked wasm-tools@1.225.0`)

Before starting, ensure that you have the following installed in addition to the Go (1.23+) toolchain:

- [`tinygo`](https://tinygo.org/getting-started/install/) for compiling Go (always use the latest version)
- [`wasm-tools` (<=1.225.0)](https://github.com/bytecodealliance/wasm-tools#installation) for Go bindings
- [wasmCloud Shell (`wash`)](https://wasmcloud.com/docs/installation) for building and running the components and wasmCloud environment
- [`docker`][docker] for easily running instances of [`postgres`]

[wasmCloud]: https://wasmcloud.com/docs/intro
[docker]: https://docs.docker.com
[wash]: https://wasmcloud.com/docs/installation
[wasm-tools]: https://github.com/bytecodealliance/wasm-tools#installation

## 🐘 Start a local Postgres cluster

Before we can connect to a Postgres database cluster, we'll need to have one running. You can start one quickly with `docker`:

```shell
docker run \
    --rm \
    -e POSTGRES_PASSWORD=postgres \
    --name pg -p 5432:5432\
    postgres:16.2-alpine
```

## 👟 Run the example

Clone the [wasmCloud/go repository](https://github.com/wasmcloud/go):

```shell
git clone https://github.com/wasmCloud/go.git
```

Change directory to `examples/component/sqldb-postgres-query`:

```shell
cd examples/component/sqldb-postgres-query
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

This will create a folder called `build` which contains `sqldb-postgres-query_s.wasm`.

>  ⚠️ If you're using a local build of the provider (using `file://...` in `wadm.yaml`) this is
> a good time to ensure you've built the provider archive `par.gz` for your provider.

### Start a wasmCloud environment

Start a local wasmCloud environment (using the `-d`/`--detached` flag to run in the background):

```shell
wash up -d
```

### Deploy the application

```shell
wash app deploy wadm.yaml
```

To ensure that the application has reached `Deployed` status, you can use `wash app list`:

```shell
wash app list
```

### Invoke the component

Once the component and provider are deployed, you can invoke the example component with the [`wash call` subcommand](https://wasmcloud.com/docs/cli/wash#wash-call), which invokes a function on a component:

```shell
wash call go_sqldb_postgres_query-querier wasmcloud:examples/invoke.call
```

Note that the name of the component is prefixed with the application name (specified in the application manifest (`wadm.yaml`) metadata), and the interface on it we call is defined in `wit/provider.wit` (the `call` function of the `invoke` interface).

### Clean up

You can delete an application from your wasmCloud environment by referring either to its application name (`sqldb-postgres-query`) or the original application manifest:

```shell
wash app delete wadm.yaml
```

Stop your local wasmCloud environment:

```shell
wash down
```

Remember to stop your PostgresDB container as well.

### Running tests

You can also run tests using [wadge](https://github.com/wasmCloud/wadge). Because this example uses a custom interface (`wasmcloud:postgres`), there is a test harness component in the `test-harness` directory of this example. You can modify this harness (or create another one for other test cases). If you change the harness, you'll need to `rm build/test-harness.wasm`. When you run `wash build` again it will build the test harness component. Alternatively, you can run `go generate ./...` to regenerate the test harness.

## 📖 Further reading

For more on building components, see the [Component Developer Guide](https://wasmcloud.com/docs/developer/components/) in the wasmCloud documentation.
