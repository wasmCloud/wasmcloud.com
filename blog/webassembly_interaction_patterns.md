---
slug: webassembly-patterns-command-reactor-library
title: "WebAssembly Interaction Patterns: Command, Reactor, Library"
image: "/img/interaction_patterns.jpg"
date: 2023-06-06T09:00:00+05:00
author: "Kevin Hoffman"
author_profile: "https://mastodon.world/@autodidaddict"
categories: ["webassembly", "components", "patterns"]
description: Exploring WebAssembly Interaction Patterns - Command, Reactor, and Library"
draft: false
---

![abstract interaction pattern shapes](/img/interaction_patterns.jpg)

The first thing people need to learn when encountering WebAssembly for the first time is how to interact with the code inside the module.
There are a number of patterns available for this and, in this blog post, I'll cover the main three: _Command, Reactor_, and _Library_.

<!-- truncate -->

As we've mentioned in a number of posts and conference talks, WebAssembly's isolated sandbox forces people to use functions that
can only accept and return numbers. _Bailey Hayes_ likes to refer to this aspect of WebAssembly as just _"[a bunch of numbers in a trenchcoat](https://youtu.be/6_BRLqxiZPU?t=459)"_. There are 
plenty of libraries, wrappers, tools and extensions that try and hide this basic fact, but it's important to understand, underneath it all, its comes down to exchanging numbers.

Once we get past the fact that we're only dealing with numbers, we can then move on to explore _how_ we're going to interact with the module. Let's take a look at each of these patterns in turn.

## The Command Pattern
In this pattern, a `command` is a bundle of logically connected information. This command represents an _imperative_: a request that work be performed. Generally
speaking, the command pattern involves sending a request and then obtaining a response. The defining characteristics of this pattern are the single execution of the command and
the request/response nature of the interaction.

Commands can be anything from a simple request to add two numbers together to a complex request to perform object recognition on an image frame. The mechanics of getting this 
command into a WebAssembly module and getting the response back usually involves building the module to target **WASI**, accepting a single command input over **stdin** and delivering
the response via **stdout**.

The primary appeal of this pattern is simplicity and availability. Even languages that struggle to produce freestanding WebAssembly modules (e.g. targeting `wasm32-unknown-unknown`) can often 
produce `wasm32-wasi` modules. Accepting data via **stdin** means that the WASI plumbing takes care of marshaling the data through linear memory and the developer doesn't have to do that manually. Returning the result is a simple matter of writing to **stdout**.

The net effect on the developer is a huge boon during today's highly volatile Wasm ecosystem. You can write code that runs both as a regular console app and as a WASI module. This makes
the code easy to reason about, easy to build, easy to test and (theoretically) automatically portable to any platform that supports WASI. Sending the request to the module is a simple matter of invoking its default exported function (usually `start` or `_start`).

Here's a few lines of Rust code that can work as easily via `cargo run` as they can as a WASI module:
```rust
fn main() -> io::Result<()> {
    let mut buffer = String::new();
    let stdin = io::stdin(); 
    stdin.read_line(&mut buffer)?;
    println!("Hello, {}!", buffer.trim());
    Ok(())
}
```
This code reads a line of text from **stdin** and writes a greeting back out. This will work whether you're running it as a CLI app or as a WASI module. In fact, you could simply execute
this WASI module via the `wasmtime` CLI tool. More common than reading a line, we typically see modules that accept everything available on stdin and then process it, which could mean
deserializing JSON or some other binary format.

In many command pattern implementations, this module could be started up on demand, process a single request, and then shut down. This is a very common pattern for serverless functions.

## The Reactor Pattern
It's easy to overthink this one. Rather than being named after some specific library or technology, in this case **reactor** is as its name implies: it _reacts_. 
The reactor pattern is a command pattern that doesn't shut down after processing a single request. Instead, it stays running and waits for more requests. While both the command and reactor patterns can make use of callbacks for host facilities, these types of callbacks are far more prevalent in reactors. Many implementations of the reactor pattern require that some form of `setup` or `init` function be called prior to the reactor being able to process requests.

Another fundamental difference is that, while the command pattern commonly maps a single module to a single function, a reactor can respond to multiple different types of stimulus (which can be modeled as commands, events, or anything else). You'll typically see a dispatcher inside a reactor that routes the request to the appropriate handler. This is a common pattern in many languages and frameworks, but it's especially common in JavaScript and Node.js.

Today Wasm's single-threaded nature implies a single-threaded reactor much like **Node.js**. However, as Wasm becomes more multi-threaded, we'll likely see multi-threaded reactors as well.

We can start and stop reactor-based Wasm modules on demand and use them like serverless functions. However, probably the most common use of the reactor pattern is for creating long-running services that can be invoked via HTTP or some other protocol. In this case, the module is started up and then waits for requests to come in. The module can be shut down when the service is no longer needed.

Here's an example of a reactor that reads lines of text from **stdin** in a loop and dispatches the input to a handler. It continues either until it is shut down or until it receives an empty line:

```rust
use std::io::{self, BufRead};

fn main() -> io::Result<()> {
    let mut lines = io::stdin().lock().lines();

    while let Some(line) = lines.next() {
        let input = line.unwrap();
        
        if input.len() == 0 {
            break;
        }
        dispatch(input)?;
    }    
    Ok(())
}
```

Note that reactors don't necessarily need to use **stdin**. They can accept any form of stimulus from the host.

## The Library Pattern
The state of the Wasm ecosystem today demands the most from developers when working with the library pattern. In this pattern, the Wasm module is loaded into the host and then the host calls functions inside the module, which can, in turn, make requests of the host. This is the most common pattern for working with Wasm modules in the browser and some cloud frameworks today. It's also the most common pattern for working with Wasm modules in languages that don't yet support WASI.

In this pattern, the Wasm module exposes a _library_ of functions to the host. The host can also provide callbacks to the module. This pattern is the most flexible of the three, but it also requires the most work from the developer, as they need to understand how to marshal rich data into and out of the module and how to handle callbacks. This demand can be softened with the use of wrapper libraries and code generation. 

WebAssembly modules in the browser use the library pattern due to the lack of availability of WASI. wasmCloud actors are currently implemented using the library pattern, and we do provide a whole suite of code generation and convenience libraries to make this easier for developers. 

The library pattern is also where you will find WebAssembly _components_. Components are small units of compute that can be composed and stitched together in all manner of shapes and sizes; the Lego to Docker's Duplo. The Wasm ecosystem for components is still an early and burgeoning one, but it's one that we're very excited about as it has the potential to completely remove our need to pick just one of the patterns. With components, we can use libraries written in other languages with no extra effort, and we can combine components and support WASI-style command and reactor invocations. 

## Summary
In this blog post, we took a quick tour of the three main patterns for working with WebAssembly modules. We saw that the command pattern is the simplest and most portable, but it's also the most limited. The reactor pattern is a bit more complex, but it's also more flexible. The library pattern is the most complex (this should change in the near future), but it's also the most flexible. If we distill things down to their smallest cores, we can equate these WebAssembly interaction patterns to classic strategies most of us are already familiar with:

* _**Command** -> Serverless_
* _**Reactor** -> Services_
* _**Library** -> Components & Hybrid_ (**wasmCloud**)

We hope that this post has helped you understand the differences between these patterns and how and when they can be used. If this post inspired any ideas or questions, please join us in the [wasmCloud community](https://slack.wasmcloud.com/)! We'd love to hear from you.
