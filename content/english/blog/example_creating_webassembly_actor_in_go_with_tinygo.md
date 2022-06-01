---
title : "Building Portable, Scalable Components with TinyGo and wasmCloud"
image : "images/tinygo-logo.png"
date: 2022-05-25T9:00:00-04:00
author: "Kevin Hoffman"
author_profile: "https://www.linkedin.com/in/%F0%9F%A6%80-kevin-hoffman-9252669/"
description : "A walkthrough of creating a TinyGo wasmCloud actor"
categories: ["tinygo", "webassembly", "wasmcloud", "go", "example"]
draft : false
---

[TinyGo](https://tinygo.org) is _"a Go compiler for small places"_. It is a language designed specifically to work on embedded systems and WebAssembly. If you squint hard enough, you can almost imagine that WebAssembly is a form of embedded system (it's embedded in a host runtime).

One of the core tenets of wasmCloud has always been that we embrace the specification without doing anything proprietary. In other words, anyone who knows the "<u>[wasmCloud ABI](https://wasmcloud.dev/reference/wasmbus/ffi/)</u>" can create actors in any language that compiles to freestanding WebAssembly. While this is technically true, it's certainly a lot easier when we have an easy SDK and code generation support for a language. Using our SDKs gives you a more friendly library while helping insulate your code from changes to the underlying WebAssembly spec.

The newest language in our arsenal is TinyGo.

To get started, you'll need <u>[wash](https://github.com/wasmcloud/wash)</u> version `0.11.0` or newer.

Let's create a new empty actor from a template as follows:

```terminal
 $ wash new actor
? Select a project template: ›
  hello: a hello-world actor (in Rust) that responds over an http connection
❯ echo-tinygo: a hello-world actor (in TinyGo) that responds over an http connection
```

I'm going to call this new project `kvcounter` because, for this blog post, we're going to build an actor that exposes a RESTful interface to a counter service.

This is the actor we get "out of the box":

```
package main

import (
	"github.com/wasmcloud/actor-tinygo"
	"github.com/wasmcloud/interfaces/httpserver/tinygo"
)

func main() {
	me := Kvcounter{}
	actor.RegisterHandlers(httpserver.HttpServerHandler(&me))
}

type Kvcounter struct{}

func (e *Kvcounter) HandleRequest(
	ctx *actor.Context, 
	req httpserver.HttpRequest)
	(*httpserver.HttpResponse, error) {
	r := httpserver.HttpResponse{
		StatusCode: 200,
		Header:     make(httpserver.HeaderMap, 0),
		Body:       []byte("hello"),
	}

	return &r, nil
}
```
In the preceding code, the `RegisterHandlers` function sets up the appropriate dispatch so that when the bound HTTP server capability provider receives a request, it knows to invoke this actor.

What we're going to do for this blog post is modify this web request handler so that it takes the name of a counter from the request, increments it using the key-value interface, and returns the new value in response.

First, let's add another provider interface to our imports by first running `go get`

```terminal
go get github.com/wasmcloud/interfaces/keyvalue/tinygo
```

This will modify our `go.mod` file to contain the new interface. Now let's create a new version of the `HandleRequest` function:

```
func (e *Kvcounter) HandleRequest(
	ctx *actor.Context, 
	req httpserver.HttpRequest) (*httpserver.HttpResponse, error) {
	
	key := strings.Replace(req.Path, "/", "_", -1)

	kv := keyvalue.NewProviderKeyValue()

	count, err := kv.Increment(ctx, keyvalue.IncrementRequest{
		Key: key, Value: 1,
	})
	if err != nil {
		return InternalServerError(err), nil
	}

	res := "{\"counter\": " + strconv.Itoa(int(count)) + "}"

	r := httpserver.HttpResponse{
		StatusCode: 200,
		Header:     make(httpserver.HeaderMap, 0),
		Body:       []byte(res),
	}
	return &r, nil
}

func InternalServerError(err error) *httpserver.HttpResponse {
	return &httpserver.HttpResponse{
		StatusCode: 500,
		Header:     make(httpserver.HeaderMap, 0),
		Body:       []byte(err.Error()),
	}
}
```
In this new function, we are converting the `Path` from the request into a key that will then be used in an `Increment` operation on the key-value store. 

Something might look a little "off" in the code, and that's this line:

```
res := "{\"counter\": \"" + strconv.Itoa(int(count)) + "\"}"
```

This is something that we have to watch out for in TinyGo. If we use the stock JSON encoding/marshaling package, then TinyGo will use the following WebAssembly imports (shown in `wat`):

```
(import "env" "runtime.ticks" (func $runtime.ticks (type 2)))
(import "env" "syscall/js.valueGet" (func $syscall/js.valueGet (type 3)))
(import "env" "syscall/js.valuePrepareString" (func $syscall/js.valuePrepareString (type 4)))
(import "env" "syscall/js.valueLoadString" (func $syscall/js.valueLoadString (type 3)))
(import "env" "syscall/js.finalizeRef" (func $syscall/js.finalizeRef (type 5)))
```
To get the preceding output, I typically run the following command (though use could also use `wasm-objdump`, too):
```
wasm2wat build/kvcounter_s.wasm| grep import
```
The `wasm2wat` binary is included in the [wabt](https://github.com/WebAssembly/wabt) toolkit.

There are still quite a few places in TinyGo where importing a certain package will trigger the use of the `syscall/js` package. Once this package is imported, the host runtime will then _require_ the use of these JavaScript host shims and we then immediately lose all of our portability benefits.

TinyGo is rapidly plugging these holes and providing packages that don't require a JavaScript host runtime, but we still need to watch out for things like this. To keep this example simple rather than hunting for an alternative JSON encoder, we just created a string that contains valid JSON.

Now, just like any other wasmCloud actor, we can modify the `CLAIMS` variable in the actor's `Makefile` to contain both the HTTP server contract and the Key-Value contract:

```
CLAIMS   = --http_server --keyvalue
```
With our new TinyGo actor in hand, we can start the actor, start two capability providers (HTTP and Key-Value), provide a link definition, and finally curl the running endpoint:

```
$ curl http://localhost:8080/bloggo
{"counter": 1}
$ curl http://localhost:8080/bloggo
{"counter": 2}
```
This is just the beginning of a really fun journey supporting TinyGo actors in wasmCloud!

For a fully functioning version of this sample, you can take a look at it in our <u>[examples repository](https://github.com/wasmCloud/examples/tree/main/actor/kvcounter-tinygo)</u>.

