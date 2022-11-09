---
title: "Testing the actor (Rust)"
date: 2018-12-29T10:00:00+00:00
weight: 8
draft: false
---

Now that your actor project is generated we can write a simple unit test to verify its functionality. We want to ensure that our logic to parse the query string for a name and return `Hello <name>` is correct.

Right now, our actor is laid out in a way that is difficult to test properly. Let's look at the function signature inside of the `impl` block:
```rust
async fn handle_request(
    &self,
    _ctx: &Context,
    req: &HttpRequest,
) -> std::result::Result<HttpResponse, RpcError> {
    let text = form_urlencoded::parse(req.query_string.as_bytes())
        .find(|(n, _)| n == "name")
        .map(|(_, v)| v.to_string())
        .unwrap_or_else(|| "World".to_string());

    Ok(HttpResponse {
        body: format!("Hello {}", text).as_bytes().to_vec(),
        ..Default::default()
    })
}
```

This function accepts `&self` and `&Context` arguments which are unused for our business logic. Additionally, the function is `async` which requires a separate dependency to call this function from a test. We can remediate these issues with just a little bit of refactoring.

```rust
/// Implementation of HttpServer trait methods
#[async_trait]
impl HttpServer for HelloActor {
    /// Returns a greeting, "Hello World", in the response body.
    /// If the request contains a query parameter 'name=NAME', the
    /// response is changed to "Hello NAME"
    async fn handle_request(
        &self,
        _ctx: &Context,
        req: &HttpRequest,
    ) -> std::result::Result<HttpResponse, RpcError> {
        handle_http_request(req)
    }
}

fn handle_http_request(req: &HttpRequest) -> std::result::Result<HttpResponse, RpcError> {
    let text = form_urlencoded::parse(req.query_string.as_bytes())
        .find(|(n, _)| n == "name")
        .map(|(_, v)| v.to_string())
        .unwrap_or_else(|| "World".to_string());

    Ok(HttpResponse {
        body: format!("Hello {}", text).as_bytes().to_vec(),
        ..Default::default()
    })
}
```

Moving the bulk of our business logic to a synchronous, stateless function makes it much easier to test. Now that we've done the above refactor, we can paste the following code at the bottom of the file:
```rust
#[cfg(test)]
mod test {
    use crate::handle_http_request;
    use std::collections::HashMap;
    use wasmcloud_interface_httpserver::{HttpRequest, HttpResponse};

    #[test]
    fn can_handle_request() {
        let request = HttpRequest {
            method: "GET".to_string(),
            path: "/".to_string(),
            query_string: "name=test".to_string(),
            header: HashMap::new(),
            body: vec![],
        };

        let response: HttpResponse = handle_http_request(&request).unwrap();

        assert_eq!(response.status_code, 200);
        assert_eq!(
            String::from_utf8(response.body).unwrap(),
            "Hello test".to_string()
        );
    }
}
```

If you're new to Rust, the `#[cfg(test)]` and `#[test]` annotations are special markers that denote this module and function as a test function, so they will not be compiled into your WebAssembly module.

This test `can_handle_request` constructs an `HttpRequest` object and passes it to our `handle_http_request` function, asserting that the `HttpResponse` object has a successful status code and contains our intended `Hello test` body.

To run this test, use the following command:

{{% tabs %}}
{{% tab "Unix" %}}

```shell
# Override wasm32-unknown-unknown with default rustc target
cargo test --target=$(rustc -vV | awk '/host:/ {print $2}')
```

{{% /tab %}}
{{% tab "Windows" %}}

```powershell
# Override wasm32-unknown-unknown with default rustc target
cargo test --target=$(rustc -vV | Select-String "host" | Out-String | ForEach-Object { $_.Split(':')[1] })
```

{{% /tab %}}
{{% tab "Other" %}}
Running this test requires you to override the default `wasm32-unknown-unknown` target that is used to build actor WebAssembly modules. You can find your default target by running `rustc -vV` and looking for the `host:` entry, or by running `rustup default` and removing `stable-` or `nightly-` from the output.
```shell
# e.g. cargo test --target=x86_64-unknown-linux-gnu
cargo test --target=<your_native_target>
```
{{% /tab %}}
{{% /tabs %}}