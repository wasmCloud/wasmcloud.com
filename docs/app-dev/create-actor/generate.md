---
title: "Generating a new actor project"
date: 2018-12-29T11:00:00+00:00
weight: 3
draft: false
---

{{% tabs %}}
{{% tab "Rust" %}}
Creating the scaffold for a new actor in Rust is easy. We will create an actor that accepts an HTTP request and responds with "Hello World". To create your new actor project, change to the directory where you want the project to be created, and enter the command below. The last term on the command `hello` is the project name. If you choose a different project name, the name of the subdirectory and some symbols in the generated code will be different from the example code in this guide.

```shell
wash new actor hello --template-name hello
```

Let's change into the newly-created folder `hello` and take a look at the generated project. The file `src/lib.rs` includes an imports section, a struct `HelloActor`, and an `impl` block that implements the `HttpServer` trait for the actor struct. Let's walk through these sections in detail.

Note the two lines near the top of the source code file:

```rust
use wasmbus_rpc::actor::prelude::*;
use wasmcloud_interface_httpserver::{HttpRequest, HttpResponse, HttpServer, HttpServerReceiver};
```
This shows us that we're using a core wasmCloud crate called `wasmbus_rpc` and we've also declared a dependency on the `wasmcloud_interface_httpserver` crate. By convention, all first-party wasmCloud interface crates begin with `wasmcloud_interface`.

Just below that, you'll see:

```rust
#[derive(Debug, Default, Actor, HealthResponder)]
#[services(Actor, HttpServer)]
struct HelloActor {}
```

`HelloActor` is the name of your actor - if you chose a different project name, the actor name will include your project name.

The two lines above the actor name invoke Rust macros that generate - at compile time - nearly all of the scaffolding needed to build an actor. The `HealthResponder` term generates a function that automatically responds to health check queries from the wasmCloud host. The `#[services(...)]` line declares the services ('traits', in Rust) that your actor implements, and generates message handling code for those interfaces. All actors implement the `Actor` interface. The `HttpServer` entry declares that the actor will also implement that interface, and requires an implementation of that trait's method: `handle_request`.
```rust
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
        let text=form_urlencoded::parse(req.query_string.as_bytes())
            .find(|(n, _)| n == "name")
            .map(|(_, v)| v.to_string())
            .unwrap_or_else(|| "World".to_string());
        Ok(HttpResponse {
            body: format!("Hello {}", text).as_bytes().to_vec(),
            ..Default::default()
        })
    }
}
```

Within the `handle_request` method, the actor receives the HTTP request, and returns an HttpResponse, which is sent back to the http client (such as a `curl` command or a web browser). We'll look into the details of that method, and customize it, shortly.
{{% /tab %}}

{{% tab "TinyGo" %}}
wasmCloud introduced support for generating a TinyGo project in wash `v0.11.0`. We will create an actor that accepts an HTTP request and responds with "Hello World". To create your new actor project, change to the directory where you want the project to be created, and enter the command below. The last term on the command `hello` is the project name. If you choose a different project name, the name of the subdirectory and some symbols in the generated code will be different from the example code in this guide.

```shell
wash new actor hello --template-name echo-tinygo
```

Let's change into the newly-created folder `hello` and take a look at the generated project. The file `hello.go` will include imports, a `main` function, a `Hello` struct, and an HTTP handler. Let's walk through these pieces in depth.

```go
import (
	"github.com/wasmcloud/actor-tinygo"
	"github.com/wasmcloud/interfaces/httpserver/tinygo"
)
```
This shows us that we're using a core wasmCloud package called `actor-tinygo` and we've also declared a dependency on the `interfaces/httpserver/tinygo` package. All first-party wasmCloud interface packages have this naming convention.

Just below that, you'll see:

```go
func main() {
	me := Hello{}
	actor.RegisterHandlers(httpserver.HttpServerHandler(&me), actor.ActorHandler(&me))
}
type Hello struct{}
```

`Hello` is the name of your actor - if you chose a different project name, the actor name will include your project name.

The purpose of the `main` function in your TinyGo module is to use the wasmCloud actor library to register function handlers. In this case, our actor is making use of the `wasmcloud:httpserver` capability to receive and handle HTTP requests and is registering the `HandleRequest` function to do so.

```go
func (e *Hello) HandleRequest(ctx *actor.Context, req httpserver.HttpRequest) (*httpserver.HttpResponse, error) {
	r := httpserver.HttpResponse{
		StatusCode: 200,
		Header:     make(httpserver.HeaderMap, 0),
		Body:       []byte("hello"),
	}
	return &r, nil
}
```

Within the `HandleRequest` method, the actor receives the HTTP request, and returns an HttpResponse with a body of `hello`, which is sent back to the http client (such as a `curl` command or a web browser). We'll look into the details of that method, and customize it, shortly.

{{% /tab %}}
{{% /tabs %}}
If you use an IDE that comes with code completion and hover-tooltips, you'll be able to see documentation and get strongly-typed guidance as you develop code to interact with the wasmCloud interfaces.

### Something's missing

Before we get into modifying the scaffolding to create the rest of this actor, take a look at what's _not_ included in this code. This code returns an abstraction of an HTTP response. It is _not_ tightly coupled to any particular HTTP server. Furthermore, you don't see the port number or server configuration options anywhere in the code. Finally, you can scale and compose this actor any way you see fit without ever having to recompile or redeploy it.

_This is the way development was meant to be_.

Pure business logic, with all of your non-functional requirements handled through loosely coupled abstractions by runtime-configurable hosts. _No boilerplate, no fuss_.