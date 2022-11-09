---
title: "Combining capabilities"
date: 2018-12-29T11:02:05+06:00
weight: 4
draft: false
---

Many of the examples we've covered in the documentation have been actors that make use of a single capability. For example, we often illustrate a number of topics by creating an actor that responds to HTTP server requests with some variation of "Hello world!" This is just the tip of the iceberg! The real power of wasmCloud shines when you start plugging in multiple actor interfaces to a single actor.

### Combining key-value and HTTP server

The [kvcounter](https://github.com/wasmCloud/examples/tree/main/actor/kvcounter) example provides an illustration of handling HTTP requests from a web server _and_ performing read and write operations against a key-value store.

In the [previous](../std-caps/) section on standard capabilities, we covered how easy it is to simply add a project reference to an actor. You are free to pick and choose multiple interfaces to create powerful actors that accomplish a great deal with just a small amount of code.

Let's take a look at how little code it takes to interact with a robust key-value store in response to an HTTP server capability provider. (As it should be, the host runtime is taking care of the non-functional requirements):

```rust
#[async_trait]
impl HttpServer for KvCounterActor {
  async fn handle_request(
    &self, 
    ctx: &Context,
    req: &HttpRequest) -> RpcResult<HttpResponse> {

    // make friendlier key
    let key = format!("counter:{}", req.path.replace('/', ":"));

    // bonus: use specified amount from query, or 1
    let amount: i32 = form_urlencoded::parse(req.query_string.as_bytes())
        .find(|(n, _)| n == "amount")
        .map(|(_, v)| v.parse::<i32>())
        .unwrap_or(Ok(1))
        .unwrap_or(1);

    // increment the value in kv and send response in json
    let (body, status_code) = 
        match increment_counter(ctx, key, amount).await {
            Ok(v) => (json!({ "counter": v }).to_string(), 200),
            // if we caught an error, return it to client
            Err(e) => (
                json!({ "error": e.to_string() }).to_string(), 500
            ),
        };
    let resp = HttpResponse {
        body: body.as_bytes().to_vec(),
        status_code,
        ..Default::default()
    };
    Ok(resp)
  }
}
```

Your business logic and the capability providers that it connects to are like building blocks. Stack them and recombine them in new ways to create amazing distributed applications.
