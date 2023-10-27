---
title: "OpenTelemetry Tracing"
date: 2022-07-11T09:02:05+06:00
sidebar_position: 4
draft: false
---

Support for exporting traces was added in version `0.55.0` of the wasmCloud host. This can be _extremely_ useful for debugging, benchmarking, and developing wasmCloud applications due to the highly distributed nature of wasmCloud. If you haven't used [OpenTelemetry](https://opentelemetry.io/)(OTEL) before, the [Distributed Traces](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces) section of the OTEL documentation is useful for prerequisite knowledge.

The most applicable bit is:
:::note
A **Distributed Trace**, more commonly known as a **Trace**, records the paths taken by requests (made by an application or end-user) as they propagate through multi-service architectures, like microservice and serverless applications.
:::

As of [wasmbus-rpc v0.9](https://crates.io/crates/wasmbus-rpc) the feature `otel` can be enabled for any capability providers. Once enabled functions can be instrumented to provide traces through your custom provider. wasmCloud first-party providers already have this feature enabled and functions instrumented, and actors do not need to do any additional work to take advantage of OTEL.

### Tracing in Action

Clone the [examples](https://github.com/wasmCloud/examples) repository locally and `cd` into the `petclinic` directory. There you'll find our microservices example, and you can simply run `./run.sh all` in your terminal to ensure you have some prerequisites installed. Once you're up and running you should see at the bottom of the script:

```plain
PetClinic started successfully and is available at http://localhost:8080
```

To explore the application and what tracing shows you, feel free to poke around the app at [http://localhost:8080](http://localhost:8080). In the petclinic folder under `docker/logs.txt` there will be output from the `tempo_1` container for each trace and span (a span is essentialy a single section of logic like a function call in a trace.) You can `tail -f docker/logs.txt` this file and then click on the `Vets` tab in the Petclinic UI to get output like the following:

```bash
2022-07-11T16:09:08.742923Z  INFO request{method=GET path=/vets actor_id=MA5DZLFF733IR7TIDMBNOUMDS7I32NFUJIZ7LBSS5ED3V6GPFTDZJXZ3}: warp::filters::trace: processing request
2022-07-11T16:09:08.765667Z DEBUG rpc:rpc:dispatch{public_key=MBZ3XLCME3RZBF7GQJ2LNIFZXHOGEJ2I7GVRHSIOPERWQXGMAH5NCI4F operation=SqlDb.Query}:query{actor_id=Some("MBZ3XLCME3RZBF7GQJ2LNIFZXHOGEJ2I7GVRHSIOPERWQXGMAH5NCI4F")}: sqldb_postgres: executing read query
2022-07-11T16:09:08.784536Z  INFO request{method=GET path=/vets actor_id=MA5DZLFF733IR7TIDMBNOUMDS7I32NFUJIZ7LBSS5ED3V6GPFTDZJXZ3}: warp::filters::trace: finished processing with success status=200
tempo_1      | level=info ts=2022-07-11T16:09:11.238063552Z caller=distributor.go:409 msg=received spanid=08329a3ab0d07420 traceid=3254bd41d3d557cb9f71fd3c3edb02fb
tempo_1      | level=info ts=2022-07-11T16:09:11.23825326Z caller=distributor.go:409 msg=received spanid=a58d9cb2caf2611f traceid=3254bd41d3d557cb9f71fd3c3edb02fb
...
tempo_1      | level=info ts=2022-07-11T16:09:12.538655178Z caller=distributor.go:409 msg=received spanid=0ef65bc127f42a3e traceid=3254bd41d3d557cb9f71fd3c3edb02fb
tempo_1      | level=info ts=2022-07-11T16:09:12.540479636Z caller=distributor.go:409 msg=received spanid=4b5458acd123261f traceid=3254bd41d3d557cb9f71fd3c3edb02fb
```

The important part to notice here is a `traceid` with multiple different spans, this `traceid` is the unique identifier for the entire operation of retrieving those Vets through wasmCloud. Copy that `traceid` and navigate to [http://localhost:5050](http://localhost:5050) which is where Grafana is running. Click the compass icon (explore) in the left sidebar, and then select `Tempo` in the dropdown next to **Explore**. Then you can input your trace ID in the search bar and click `Run query` in the top right. You should see a trace like this:
![Distributed Petclinic trace](/img/petclinic_trace.png)

As you can see, we retrieved the list of vets in our database in just under 40ms from the HTTP server provider, to the API actor, to the Vets actor, and finally querying the SQLDB Postgres provider. You can expand any of these spans to get more information on the specific call like the Actor ID, the operation name, the line of code that the function is on, etc.

### Tracing setup for your project

In order to enable tracing we'll take a look at the above example to show you what to set up. At a high level, you'll need:

1. wasmCloud [v0.55.1](https://github.com/wasmCloud/wasmcloud-otp/releases/tag/v0.55.1) or later with the following environment variables:
   - `OTEL_TRACES_EXPORTER=otlp` To set the exporter to `otlp`
   - `OTEL_EXPORTER_OTLP_ENDPOINT=<tracing exporter backend>` To export traces to your backend, e.g. `http://localhost:55681` for Tempo.
1. A tracing backend that supports [otlp](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/otlp.md), [Grafana Tempo](https://github.com/grafana/tempo) was what we chose for its simplicity for Docker compose, but [Zipkin](https://zipkin.io/) and [Jaeger](https://www.jaegertracing.io/) are open source and also visualize traces. There are also commercial / "production-grade" offerings like [DataDog](https://www.datadoghq.com/knowledge-center/distributed-tracing/#distributed-tracing-tools) and [Honeycomb](https://www.honeycomb.io/trace/) too.
1. Capability providers using `wasmbus-rpc 0.9+` with the `otel` feature enabled

#### Enabling tracing for capability providers

Capability providers don't enable tracing by default following our principle of simplicity and security by default. To enable it in the Rust capability providers you'll simply need to enable the `otel` feature, you can see an example of this in the HTTPClient provider [here](https://github.com/wasmCloud/capability-providers/blob/916cc95c09c27faf0cb202003ff1f39ef9059a1b/httpclient/Cargo.toml#L27). Then, you'll want to use the [tracing crate](https://crates.io/crates/tracing) to **instrument** your function calls that you want to trace. Here's an example of an instrumented function call in the HttpClient provider:

```rust
#[instrument(level = "debug", skip(self, _ctx, req), fields(actor_id = ?_ctx.actor, method = %req.method, url = %req.url))]
async fn request(&self, _ctx: &Context, req: &HttpRequest) -> RpcResult<HttpResponse> {
    let mut headers: HttpHeaderMap = HttpHeaderMap::default();
    convert_request_headers(&req.headers, &mut headers);
    // Elided
    if (200..300).contains(&(status_code as usize)) {
        tracing::debug!(
            %status_code,
            "http request completed",
        );
    } else {
        tracing::warn!(
            %status_code,
            "http request completed with non-200 status"
        );
    }
    Ok(HttpResponse {
        body: body.to_vec(),
        header: headers,
        status_code,
    })
}
```

When an HTTP Request command goes through the HTTPClient provider, this function will be instrumented and included in the overall trace that originated from elsewhere in the wasmCloud application (either in wasmbus-rpc or in the wasmCloud host, you don't need to worry about that). We're instrumenting the above function at a `debug` level and recording the actor ID, the request method, and the URL as a part of the span. You can also see an example a few lines down of using the `tracing::debug!` and `tracing::warn!` macros for additional logging. You'll want to do this for each function that you're interested in tracing for a complete view of an operation.
