# http-server

[This example](https://github.com/wasmCloud/go/tree/main/examples/provider/http-server) demonstrates
how to forward requests to components exporting `wasi:http/incoming-handler`.

It starts a http server listening on port 8080 containing 2 routes:

- `/proxy`: Forwards the request to the component `http-component`
- `/`: Serve the request directly from the provider

# Internals

Proxying uses a custom `http.RoundTripper` implementation that forwards requests to the component.
In this example we forward to a single target ( `http-http_component` ).

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
