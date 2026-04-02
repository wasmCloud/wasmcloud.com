# HTTP Server Provider

This [capability provider example](https://github.com/wasmCloud/go/tree/main/examples/provider/http-server) imports the `wasi:http/incoming-handler` interface and demonstrates how to forward HTTP requests to components that export the same interface, enabling components to accept incoming HTTP(s) requests.

The provider starts an HTTP server listening on port 8080 with two routes:

- `/proxy`: Forwards the request to the component `http-component`
- `/`: Serves the request directly from the provider

## 👟 Run the provider

Clone the [wasmCloud/go repository](https://github.com/wasmcloud/go): 

```shell
git clone https://github.com/wasmCloud/go.git
```

Change directory to `examples/provider/http-server`:

```shell
cd examples/provider/http-server
```

In addition to the standard elements of a Go project, the example directory includes the following files and directories:

- `/bindings`: An auto-generated directory for Go bindings of [interfaces](https://wasmcloud.com/docs/concepts/interfaces). Users typically will not need to interact directly with the contents of this directory.
- `/wit`: Directory for WebAssembly Interface Type (WIT) packages that define interfaces.
- `wadm.yaml`: Declarative application manifest.
- `wasmcloud.toml`: Configuration file for a wasmCloud application.

### Build the provider

Build the provider:

```shell
wash build
```

The build process will generate a `.par.gz` archive file in a new `/build` directory.

### Start a wasmCloud environment

Start a local wasmCloud environment (using the `-d`/`--detached` flag to run in the background):

```shell
wash up -d
```

### Deploy the application

The application manifest (`wadm.yaml`) for this example defines an application consisting of the locally built provider at `./build/http-server.par.gz` and an OCI image for an HTTP "Hello World" component.

Deploy the manifest:

```shell
wash app deploy wadm.yaml
```

To ensure that the application has reached `Deployed` status, you can use `wash app list`:

```shell
wash app list
```

### Send a request

Send a request to the proxy route:

```shell
curl localhost:8080/proxy
```

Send a request to the index route:

```shell
curl localhost:8080
```

### Clean up

You can delete an application from your wasmCloud environment by referring either to its application name (`http`) or the original application manifest:

```shell
wash app delete wadm.yaml
```

Stop your local wasmCloud environment:

```shell
wash down
```

## 🩻 Internals

Proxying uses a custom `http.RoundTripper` implementation that forwards requests to the component. This example forwards to a single target (`http-http_component`).

```go
transport := wrpchttp.NewIncomingRoundTripper(wasmcloudprovider, wrpchttp.WithSingleTarget("http-http_component"))

wasiIncomingClient := &http.Client{
  Transport: transport,
}

wasiIncomingClient.Get("http://localhost:8080/proxy")
```

You can also provide a custom `Director` function to select the target based on the request.

```go
func director(r *http.Request) string {
  if r.URL.Host == "api" {
    return "http-api"
  }
  return "http-ui"
}


transport := wrpchttp.NewIncomingRoundTripper(wasmcloudprovider, wrpchttp.WithDirector(director))

wasiIncomingClient := &http.Client{
  Transport: transport,
}

// forward to http-api component
wasiIncomingClient.Get("http://api/users")

// forward to http-ui component
wasiIncomingClient.Get("http://ui/index.html")
wasiIncomingClient.Get("http://anyothername/index.html")
```

## 📖 Further reading

For an introduction to capability providers, see the [Providers Overview](https://wasmcloud.com/docs/concepts/providers) in the wasmCloud documentation.

For more on building providers, see the [Provider Developer Guide](https://wasmcloud.com/docs/developer/providers/) in the wasmCloud documentation. 
