# 🐘 SQLDB Postgres Example

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/sqldb-postgres-query) is
a WebAssembly component that makes use of:

- The [`wasmcloud:postgres` WIT contract](https://github.com/wasmCloud/wasmCloud/tree/main/wit/postgres)
- The
  [`sqldb-postgres-provider`](https://github.com/wasmCloud/wasmCloud/tree/main/crates/provider-sqldb-postgres)
  Capability Provider

## 📦 Dependencies

Before starting, ensure that you have the following installed in addition to the Go toolchain:

- `tinygo` 0.33+
- [`docker`][docker] for easily running instances of [`postgres`]
- [`wash`][wash] for building and running the components and [wasmCloud][wasmcloud] hosts
- [`wasm-tools`][wasm-tools] for Go bindings

[docker]: https://docs.docker.com
[wash]: https://wasmcloud.com/docs/installation
[wadm]: https://github.com/wasmCloud/wadm
[wasm-tools]: https://github.com/bytecodealliance/wasm-tools#installation

## 👟 Quickstart

As with all other examples, you can get started quickly by using whe [Wasmcloud SHell
(`wash`)][wash].

Since `wash` supports declarative deployments (powered by [Wasmcloud Application Deployment Manager
(`wadm`)][wadm]), you can get started quickly using the `local.wadm.yaml` manifest in this folder:

## Start a local Postgres cluster

Before we can connect to a Postgres database cluster, we'll need to have one running. You can run
one quickly with `docker`:

```console
docker run \
    --rm \
    -e POSTGRES_PASSWORD=postgres \
    --name pg -p 5432:5432\
    postgres:16.2-alpine
```

### Build this component

```console
wash build
```

This will create a folder called `build` which contains `sqldb-postgres-query_s.wasm`.

> [!NOTE] If you're using a local build of the provider (using `file://...` in `wadm.yaml`) this is
> a good time to ensure you've built the [provider archive `par.gz`][par] for your provider.

### Start a wasmCloud host

```console
wash up --allow-file-load true
```

> [!NOTE] > `wash up` will run as long as the host is running (you can cancel it with `Ctrl-C`). You
> can also run it with the `-d` flag to run it in the background. If you start a host this way, you
> can stop it with `wash down`

### Deploy the example application with WADM

```console
wash app deploy wadm.yaml
```

> [!WARNING] If you simply want to stop the deployment, run `wash app delete <application name>`.
> You can also run `wash app delete wadm.yaml` if you don't want to look up the application name.

To ensure that the application is deployed you can use `wash app list`:

```console
wash app list
```

If you want to see everything running in the lattice at once:

```console
wash get inventory
```

### Invoke the demo component

Once the component & provider are deployed, you can invoke the example component with `wash call`:

```console
wash call go_sqldb_postgres_query-querier wasmcloud:examples/invoke.call
```

Note that the name of the component is prefixed with the WADM application, and the interface on it
we call is defined in `wit/provider.wit` (the `call` function of the `invoke` interface).

### Running tests

You can also run tests using [wadge](https://github.com/wasmCloud/wadge). Because this uses custom
interfaces (wasmcloud:postgres), there is a test harness component in the `test-harness` directory
of this example. You can modify this harness (or create another one for other test cases). If you
change the harness, you'll need to `rm build/test-harness.wasm`. When you run `wash build` again it
will build the test harness component. Alternatively, you can run `go generate ./...` to regenerate
the test harness.
