---
title: 'WebAssembly Components and wasmCloud Actors: A Glimpse of the Future'
image: '/img/wasm.png'
date: 2022-06-16T11:00:00-04:00
author: 'Taylor Thomas'
author_profile: 'https://twitter.com/_oftaylor'
description: 'Using the Component Model with wasmCloud Actors'
categories: ['wasm', 'webassembly', 'components']
draft: false
---

![wasm](/img/wasm.png)

Today we thought we would give you a glimpse of the future of WebAssembly and wasmCloud. As
wasmCloud maintainers, we've always had a goal to follow all standards in the WebAssembly community.
However, our other goal has been to create a platform on which you could leverage the power of Wasm
for real projects. For the last few years, these two goals have been somewhat at odds with one
another due to the bleeding-edge nature of Wasm. We've had to bridge the gap between Wasm's current
state and the requirements needed to do Something Real™ with it. This is starting to change!

<!--truncate-->

## The Component Model

In the past year, the standards around Wasm and WASI have started to solidify and become reality.
One of the most interesting emerging standards has been the [Component
Model](https://github.com/WebAssembly/component-model). The TL;DR of the component model is that you
are able to glue together arbitrary Wasm modules that import or export functions, as specified by an
interface file. These interface files are called `wit` files (Wasm Interface Types) and allow for
language agnostic code generation. This code is what handles converting the raw numbers of plain
Wasm (i.e. integers and bytes) into concrete types. If you are familiar with wasmCloud already, this
is [very similar](https://wasmcloud.com/docs/1.0/concepts/interfaces) to what we call "contract driven development,"
which we use to separate non-functional requirements from business logic. Still confused? Don't
worry, we'll be using some specific examples below. If this topic interests you and you'd like more
information, we highly recommend you check out all of the
[documentation](https://github.com/WebAssembly/component-model/tree/main/design) and
[examples](https://radu-matei.com/blog/intro-wasm-components/) that are available for the component
model.

## A New Way to Build Actors

So at this point, you are probably wondering "What does this have to do with wasmCloud? Don't you
already have your own contract stuff and RPC protocol?" Good question! Let's dive into this.

We recently created a proof of concept that shows our [kvcounter
example](https://github.com/wasmCloud/examples/blob/557770a1d1d763aab76583af9f57e2a4e2aa4e3a/actor/kvcounter/README.md)
using the Component Model to provide all the necessary logic that used to be provided by our
`wasmbus-rpc` Rust crate and other language specific libraries. Please note that this is not a fully
functional example that can run in wasmCloud currently; it's meant to show how we can glue together
various components, call the actor from the host, and then have the actor send data back to the
host. We'll break down all the different parts of this example below, but you can find the actual
source code [here](https://github.com/wasmCloud/examples/tree/spike/wit-interfaces/actor/kvcounter).

### Old vs new

![components-diagram](/img/components_diagram.png)

As you can see in the diagram above, there was a lot of stuff that had to be done inside of
language-specific and user-managed code. In fact, we just finished writing all of this code for Go
as well, and it was a heavy lift! In the future version, things become significantly more modular.
The communication to the host (which then gets sent over our RPC layer, [the
lattice](https://wasmcloud.dev/reference/lattice/)) is handled by one module, and then we just
provide a single Wasm module that satisfies each interface. This highlights why we are excited about
Wasm. Wasm is language agnostic, which means that instead of having to create special `wasmbus-rpc`
libraries for every single language we want to support, and then generating code for every
interface, we can now write a single module in whatever language we want. Then, we can use that
module to provide the necessary code to a wasmCloud actor written _in any other language_. If that
doesn't make you excited, we don't know what will.

### The detailed view

From here on out, we are going to go into the specifics of how everything works. This will likely be
useful to anyone wanting to experiment with the component model or who wants to better understand
how it works. If that doesn't interest you, please feel free to skip down to the ["What did we
learn?" section](#what-did-we-learn)

We're going to go from the top to the bottom as represented in the diagram above to explain what
each component does, so please go back and reference it if anything below is confusing. Then we'll
explain how we linked and ran the example.

#### The httpserver "receiver"

Under the new paradigm, each wasmCloud interface will need to have two different WebAssembly
modules: a sender and a receiver. The receiver half is used when the actor needs to receive a
message from the host it is running on (hence the name). In wasmCloud, this means the host will
receive a message on [the lattice](https://wasmcloud.dev/reference/lattice/) and then invoke the
`receive` method of the actor. This first module of the proof of concept is the httpserver contract
receiver. In order to implement this, the module needs to import one interface and export another.
Here are what the interfaces look like:

**wasmbus_receiver.wit**

```
// These are importing some common types that you see in the receive function signature. See the
// actual code on Github if you are curious what these types look like
use * from error-type
use * from wasmbus-common

receive: function(msg: message) -> expected<payload, rpc-error>
```

You'll see that this interface has single function, the `receive` function that allows an actor to
receive a message. We'll see how this works in code below

**httpserver.wit**

```
use * from error-type

type header-map = list<tuple<string, string>>

record http-request {
    // HTTP method. One of: GET,POST,PUT,DELETE,HEAD,OPTIONS,CONNECT,PATCH,TRACE
    method: string,
    // full request path
    path: string,
    // query string. May be an empty string if there were no query parameters.
    query-string: string,
    // map of request headers (string key, string value)
    header: header-map,
    body: list<u8>,
}

record http-response {
    // statusCode is a three-digit number, usually in the range 100-599 a value of 200 indicates success.
    status-code: u16,
    // Map of headers (string keys, list of values)
    header: header-map,
    // Body of response as a byte array. May be an empty array.
    body: list<u8>,
}

handle-request: function(req: http-request) -> expected<http-response, rpc-error>
```

The httpserver receiver has to export the `receive` method and implement the logic to parse that
message as an HTTP request. Basically, it acts as a translation layer between the RPC layer and the
actual contract it needs to call. The code for it is actually quite straightforward (and is
annotated with comments below). Our code was written in Rust, but you could write it in any language
that has [wit-bindgen](https://github.com/bytecodealliance/wit-bindgen/) support

```rust
use wasmbus_receiver::*;

// Import the httpserver contract so we can call it
wit_bindgen_rust::import!("../httpserver.wit");
// Export our implementation of the `receive` method
wit_bindgen_rust::export!("../wasmbus-receiver.wit");

const HANDLE_REQUEST_METHOD: &str = "HttpServer.HandleRequest";

// Some custom types for massaging data are elided here

#[derive(Default, Clone)]
pub struct WasmbusReceiver;

impl wasmbus_receiver::WasmbusReceiver for WasmbusReceiver {
    fn receive(msg: Message) -> Result<Payload, RpcError> {
        if msg.method != HANDLE_REQUEST_METHOD {
            return Err(RpcError::MethodNotHandled(format!(
                "Method {} is not supported by the httpserver contract",
                msg.method
            )));
        }
        // Parse the message body into an http request
        let req: HttpRequestInternal = serde_json::from_slice(&msg.arg)
            .map_err(|e| RpcError::Deser(format!("httpserver: {}", e)))?;
        // Data massaging
        let header: Vec<(&str, &str)> = req
            .header
            .iter()
            .map(|(k, v)| (k.as_str(), v.as_str()))
            .collect();

        // Call the `handle_request` method that will be provided by another module
        let resp: HttpResponseInternal = httpserver::handle_request(httpserver::HttpRequest {
            method: &req.method,
            path: &req.path,
            query_string: &req.query_string,
            header: &header,
            body: &req.body,
        })
        .map_err(httpserver_to_wasmbus_error)?
        .into();
        serde_json::to_vec(&resp).map_err(|e| RpcError::Ser(e.to_string()))
    }
}
```

#### The Business Logic

This module is the actual part that contains the business logic that someone would be writing. This
is the only user-provided code for someone writing their business logic to run on wasmCloud. All of
the other modules described in this section would be provided by the interface writer or by
wasmCloud directly.

This code also requires the use of two interfaces: httpserver (see the previous section) and
keyvalue:

**keyvalue.wit**

```
use * from error-type

// Increment the value of the key by the given amount
increment: function(key: string, value: s32) -> expected<s32, rpc-error>
```

Please note that this is a stripped-down version of what the actual keyvalue contract would look
like, to keep things simple. Now, we can move on to the actual code (annotated):

```rust
use httpserver::*;

// Import the keyvalue contract so we can call it
wit_bindgen_rust::import!("../keyvalue.wit");

// Export our implementation of the httpserver contract
wit_bindgen_rust::export!("../httpserver.wit");

#[derive(Default, Clone)]
pub struct Httpserver;

impl httpserver::Httpserver for Httpserver {
    fn handle_request(req: HttpRequest) -> Result<HttpResponse, RpcError> {
        // make friendlier key
        let key = format!("counter:{}", req.path.replace('/', ":"));

        // bonus: use specified amount from query, or 1
        let amount: i32 = form_urlencoded::parse(req.query_string.as_bytes())
            .find(|(n, _)| n == "amount")
            .map(|(_, v)| v.parse::<i32>())
            .unwrap_or(Ok(1))
            .unwrap_or(1);

        // increment the value in kv and send response in json
        let (body, status_code) = match increment_counter(key, amount) {
            Ok(v) => (serde_json::json!({ "counter": v }).to_string(), 200),
            // if we caught an error, return it to client
            Err(e) => (
                serde_json::json!({ "error": format!("{:?}", e) }).to_string(),
                500,
            ),
        };
        let resp = HttpResponse {
            body: body.as_bytes().to_vec(),
            status_code,
            header: Vec::new(),
        };
        Ok(resp)
    }
}

fn increment_counter(key: String, value: i32) -> Result<i32, RpcError> {
    // Call the `increment` function that will be provided by another module
    keyvalue::increment(&key, value).map_err(map_wit_err)
}
```

You'll see that this code looks almost identical to the [original kvcounter
actor](https://github.com/wasmCloud/examples/blob/557770a1d1d763aab76583af9f57e2a4e2aa4e3a/actor/kvcounter/src/lib.rs#L1),
except that there is **_zero wasmCloud-specific code needed_**!

#### The keyvalue "sender"

As we mentioned above, there are two halves needed for each contract. This component exports the
keyvalue contract described above and also requires one other interface:

**wasmbus-sender.wit**

```
use * from error-type
use * from wasmbus-common

send: function(msg: message, contract-name: string, link-name: option<string>) -> expected<payload, rpc-error>
```

As you can see, this has a single function called `send` that is used to send a message through the
lattice. This does the exact reverse of the receiver, in that it takes a concrete type and turns it
into a generic message that can be sent. The annotated code is below:

```rust
use keyvalue::*;
use wasmbus_sender as wasmbus;

// Export our implementation of the keyvalue contract
wit_bindgen_rust::export!("../keyvalue.wit");
// Import the sender contract for us to call
wit_bindgen_rust::import!("../wasmbus-sender.wit");

// Custom request type elided

#[derive(Default, Clone)]
pub struct Keyvalue;

impl keyvalue::Keyvalue for Keyvalue {
    fn increment(key: String, value: i32) -> Result<i32, RpcError> {
        // Encode the data as our payload
        let payload = serde_json::to_vec(&IncrementRequest { key, value })
            .map_err(|e| RpcError::Ser(e.to_string()))?;

        // Call the `send` method provided by another module
        // NOTE: this code is not dealing with the link name yet just to keep it simple
        // We will figure out how we want this to work when implementing
        let resp = wasmbus::send(
            wasmbus::Message {
                method: "KeyValue.Increment",
                arg: &payload,
            },
            "wasmcloud:keyvalue",
            None,
        )
        .map_err(wasmbus_to_keyvalue_error)?;
        serde_json::from_slice(&resp).map_err(|e| RpcError::Deser(e.to_string()))
    }
}
```

#### The host sender

Last, but not least, is the module that can send a message back to a host (so the host can send it
on the lattice). For our purposes here, this just prints to stdout (which means we are using a
function from the host just like we would for real), but when we do it for realsies, this will be
calling a specific function the host will provide for us. This module only requires the
`wasmbus-sender.wit` contract shown in the previous section. As for the code:

```rust
use wasmbus_sender::*;

// Export our implementation for the `send` method
wit_bindgen_rust::export!("../wasmbus-sender.wit");

#[derive(Default, Clone)]
pub struct WasmbusSender;

impl wasmbus_sender::WasmbusSender for WasmbusSender {
    fn send(
        msg: Message,
        contract_name: String,
        link_name: Option<String>,
    ) -> Result<Payload, RpcError> {
        // Fake a host call (fd_write in this case)
        println!(
            "Linkname: {}, contract_name: {}, msg: {:#?}",
            link_name.unwrap_or_else(|| "default".to_string()),
            contract_name,
            msg
        );
        // Return the answer to everything
        Ok(serde_json::to_vec(&42).unwrap())
    }
}
```

#### Linking and running

:::warning
**NOTE**: Right as we were preparing this blog post, the `wasmlink` command and tooling
was [removed](https://github.com/bytecodealliance/wit-bindgen/pull/240) from the wit-bindgen repo in
favor of the [most up to date component model
code](https://github.com/bytecodealliance/wit-bindgen/pull/239). This new component model tooling is
going to be the future, but currently, there isn't really a replacement for `wasmlink`. So the
section below is slightly out of date, but still shows that all of this will work with the new
tooling in the future. As we actually implement this, we will release a new blog post that shows how
the new tooling works
:::

For our proof of concept, we used the `wasmlink` command. When we do this for real, we will use the
underlying Rust linker library that `wasmlink` uses. To be honest, this tool is a little confusing
to use, so hopefully we can enlighten you here. Before linking, we built all of the modules in the
workspace by running `cargo build --release`. Once they were built, we ran the following command to
link them together

```bash
wasmlink ./target/wasm32-wasi/release/httpserver.wasm \
   -m keyvalue=./target/wasm32-wasi/release/keyvalue.wasm \
   -m httpserver=./target/wasm32-wasi/release/kvcounter_actor.wasm \
   -m wasmbus-sender=./target/wasm32-wasi/release/wasmbus_sender.wasm \
   -i wasmbus-sender=wasmbus-sender.wit \
   -i keyvalue=keyvalue.wit \
   -i httpserver=httpserver.wit \
   -i receiver=wasmbus-receiver.wit \
   -p wasmtime \
   -o compiled.wasm
```

Ok, so that is a pretty gnarly command. Let's break it down:

First off is the module name (`./target/wasm32-wasi/release/httpserver.wasm`). There is one very
important detail here. This module should be the one you want to call (the one with the `receive`
function), otherwise the export gets mangled and no longer shows up in the compiled file.

All of the `-m` flags specify the other modules to link in. They are specified in the form of
`MODULE_NAME=MODULE_PATH`. The module name must match the name of the interface it is exporting.
Those interfaces are specified with the `-i` flag with the form `MODULE_NAME=WIT_PATH`. The `-o`
flag specifies the output path where the compiled module is written to.

Oh, and that `-p` flag? Pretty sure it doesn't matter based on what we found in the code, but it is
a required flag. It does look like it may matter in the future though.

Whew...that was hard. Onward to the cool part – actually running the thing. We did this in code as
it was needed to actually call everything properly. Let's look at the whole code sample (annotated):

```rust
use wasmtime::{Config, Engine, Linker, Module, Store};
use wasmtime_wasi::WasiCtx;

// Import the wasmbus-receiver contract with the wasmtime helpers (note that this is a different
// crate than what we used above)
wit_bindgen_wasmtime::import!(
    "/Users/oftaylor/Documents/code/examples/actor/kvcounter/wasmbus-receiver.wit"
);

// Elided an http request type here

// A custom struct for storing data in the wasmtime engine
struct StoreData {
    wasi: WasiCtx,
    receiver: wasmbus_receiver::WasmbusReceiverData,
}

fn main() {
    let mut config = Config::default();
    // Enable the experimental module linking and multimemory proposals. These are required to make things work
    config.wasm_module_linking(true);
    config.wasm_multi_memory(true);
    let engine = Engine::new(&config).unwrap();

    let mut linker: Linker<StoreData> = Linker::new(&engine);
    // Add all the wasi stuff to the linker
    wasmtime_wasi::add_to_linker(&mut linker, |ctx| &mut ctx.wasi)
        .expect("Unable to add to wasi things to linker");

    let wasi = wasmtime_wasi::WasiCtxBuilder::new()
        .inherit_stdio()
        .inherit_args()
        .expect("Unable to inherit args")
        .build();

    let mut store = Store::new(
        &engine,
        StoreData {
            wasi,
            receiver: wasmbus_receiver::WasmbusReceiverData {},
        },
    );

    // Load the compiled wasm module we built above
    let receiver_module = Module::from_file(
        &engine,
        "/code/examples/actor/kvcounter/compiled.wasm",
    )
    .unwrap();

    // Use the instantiate helper from wit-bindgen
    let (server, _instance) = wasmbus_receiver::WasmbusReceiver::instantiate(
        &mut store,
        &receiver_module,
        &mut linker,
        |ctx| &mut ctx.receiver,
    )
    .unwrap();

    let req = HttpRequestInternal {
        method: "GET",
        path: "/",
        query_string: "",
        header: vec![("HOST", "foobar")],
        body: &[],
    };
    // Call the receive method exported by our module
    let resp = server
        .receive(
            &mut store,
            wasmbus_receiver::Message {
                method: "HttpServer.HandleRequest",
                arg: &serde_json::to_vec(&req).expect("Should serialize"),
            },
        )
        .expect("Shouldn't get a trap")
        .expect("Unable to send to actor");

    println!("body: {}", String::from_utf8_lossy(&resp));
}
```

When we ran this, we could see the output:

```
Linkname: default, contract_name: wasmcloud:keyvalue, msg: Message {
    method: "KeyValue.Increment",
    arg: [
        123,
        34,
        107,
        101,
        ...
    ],
}
body: {"status_code":200,"header":[],"body":[123,34,99,111,117,110,116,101,114,34,58,52,50,125]}
```

This means we got all the way down to the `send` method and returned data all the way up the stack
as the expected HTTP response!

## What did we learn?

### Benefits

- We won't need to use our bespoke Smithy + code generation any more
- No more bespoke wasmbus libraries per language. Modules can even be loaded by providers to
  properly translate a message from the lattice
- No wasmCloud-specific code when you write your actors. In fact, if our contract is the same as
  those used by other platforms, they could even be interchangeable!
- Easily pluggable and patchable wasmCloud specific code. If there is a bug fix we have to the
  underlying RPC protocol, we can hot patch all running actors with no user interaction

### Rough edges

To be clear, it isn't all sunshine and rainbows yet. These are a few of the rough edges we
encountered and how they impacted us

- No dynamic linking yet. This means we have to manually pull everything down and link it before
  we can run it. Not ideal, but we are able to do it through code.
- Linking everything means you must include both the module and the interface file when
  distributing things, which means you have to build tooling around building things like
  [bindles](https://github.com/deislabs/bindle)
- Even when you have reused types (like our `rpc-error` above in the wit files), each interface
  technically has a different type in strongly-typed languages. This requires conversion between
  the identical types imported from different interfaces. Obviously things like Rust macros can be
  use to make this a little less clunky, but it is a bit of a chore

## Where do we go from here?

Now we move into the future. To be absolutely clear, YOU CANNOT yet do this inside of wasmCloud, but
this proof of concept proved that we can use the component model to greatly improve the experience
of writing actors in wasmCloud _and_ achieve our goal of being in line with community standards. In
order to make this all work, it will take a major refactor of the underlying code we use to run
actors as well as some refactors to our RPC layer. This will obviously be a breaking change so we
will need to clearly communicate when the work is going to land so as to not disturb too many of our
current users.

We will also need to rely more heavily on [Bindle](https://github.com/deislabs/bindle) and
eventually on the forthcoming component registry work from the Bytecode Alliance. These tools are
designed specifically to account for assembling various parts of a final application (like the
various interfaces and different modules). We already have experimental support for
bindles in wasmCloud, but they have to be hand rolled
rather than being automatically created. There also needs to be a place from which you can fetch the
necessary interfaces for use in building. All of these elements of developer experience are
important to have before we roll this out.

So, stay tuned! We are planning on a follow up blog post to this one once we actually roll out the
support in wasmCloud

## Special Thanks

We wanted to give a shout out and thanks to [Radu Matei](https://radu-matei.com/) for his help as we
figured out some of the intricacies of the component model, as well as his previous work and blog
posts in this area. That work gave us a great starting place for what we are building here.
