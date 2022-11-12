---
title : ".NET: Are we WebAssembly Yet?"
image : "images/blogs/dotnet_wasm.png"
date: 2022-11-12T9:00:00-04:00
author: "Kevin Hoffman"
author_profile: "https://www.linkedin.com/in/%F0%9F%A6%80-kevin-hoffman-9252669/"
description : "Checking back in on the .NET+WebAssembly ecosystem"
categories: ["webassembly", "dotnet", ".net", "blazor", "csharp", "wasi"]
draft : false
---

With the recent [release of the .NET Framwework 7](https://devblogs.microsoft.com/dotnet/announcing-dotnet-7/), I thought it might be a good excuse to check back in on the .NET WebAssembly ecosystem and see where things stand and what improvements have been made. If you want to follow along or experiment on your own, the first thing you'll want to do is [install .NET 7](https://dotnet.microsoft.com/en-us/download/dotnet/7.0).

In nearly every case, whenever I talk to anyone about .NET and WebAssembly, the conversation shifts quickly to [Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor). Blazor, in a vacuum, doesn't interest me. Not because it isn't good, but because _Blazor owns both ends of the pipeline: the producer and the consumer_.

The practical impact of this is that they can pretty much do whatever they like. They are free of the burdens and constraints that inhibit most of us trying to work in the cloud native/backend space with WebAssembly. To see what this looks like and so you can _feel_ the smoke and mirrors at work, let's take a look at what .NET 7 thinks of as a "pure" WebAssembly application.

Type `dotnet new list` and you'll see all the templates available for you to create things:

```
These templates matched your input:

Template Name                       Short Name          Language    Tags
----------------------------------  ------------------  ----------  --------------------------------
ASP.NET Core Empty                  web                 [C#],F#     Web/Empty
ASP.NET Core gRPC Service           grpc                [C#]        Web/gRPC
...
Blazor Server App                   blazorserver        [C#]        Web/Blazor
Blazor Server App Empty             blazorserver-empty  [C#]        Web/Blazor/Empty
Blazor WebAssembly App              blazorwasm          [C#]        Web/Blazor/WebAssembly/PWA
Blazor WebAssembly App Empty        blazorwasm-empty    [C#]        Web/Blazor/WebAssembly/PWA/Empty
...
WebAssembly Browser App             wasmbrowser         [C#]        Web/WebAssembly/Browser
WebAssembly Console App             wasmconsole         [C#]        Web/WebAssembly/Console
...
```
I've trimmed out the templates that don't apply to this discussion. I was so excited when I saw the `wasmconsole` project template, I grabbed some coffee, dropped what I was doing, and started tinkering. _"Finally," I thought. "Freestanding WASM support"_.

Let's create a new wasmconsole via ``dotnet new wasmconsole`` (note that unlike Rust, this creates the project in your current directory, not a sub-directory).

```
dotnet new wasmconsole
The template "WebAssembly Console App" was created successfully.
```

At this point, I was practically jumping with joy. On a whim, I opened the `.csproj` file that was created and I saw the following, horrific thing:

```
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>

    <!-- an angel just lost its wings -->
    <RuntimeIdentifier>browser-wasm</RuntimeIdentifier>
    <WasmMainJSPath>main.mjs</WasmMainJSPath>

    <OutputType>Exe</OutputType>
    <AllowUnsafeBlocks>true</AllowUnsafeBlocks>
  </PropertyGroup>
</Project>
```

This is a serious case of false advertising. You see, what you're getting with the "_console_" target isn't actually a freestanding WebAssembly module. Oh no, instead what you're getting is a WebAssembly module that can be _hosted in JavaScript in Node.js in a console_.

This is definitely _not_ what I'm looking for. Remember earlier when I said that Blazor can do whatever it likes because it is both the producer and consumer of the module? This is fine for Blazor, but not for the WebAssembly ecosystem. Whenever you do things like build a module that will only ever function in the presence of JavaScript or (as I'll mention in a bit) even a specific so-called freestanding runtime, WebAssembly's prime asset of portability goes out the window. Hot take warning: _tightly coupled WebAssembly modules are no better than `.so`/`.dll` files_.

If you're curious, use one of the [wabt](https://github.com/WebAssembly/wabt) tools to crack open the `dotnet.wasm` file that gets produced when you compile in `bin/Debug/net7.0/browser-wasm`. Note the number of `syscall` imports that have nothing to do with the wasm or WASI standards. You'll see the same thing happen with TinyGo, where you can accidentally use functions from `syscall/js`.

So what happens when we run the application we just created?

```
WasmAppHost --runtime-config /Users/kevin/lab/dotnet/wasi2/bin/Debug/net7.0/browser-wasm/AppBundle/wasi2.runtimeconfig.json
Running: node main.mjs
Using working directory: /Users/kevin/lab/dotnet/wasi2/bin/Debug/net7.0/browser-wasm/AppBundle
mono_wasm_runtime_ready fe00e07a-5519-4dfe-b35a-f867dbaf2e28
Hello, World! Greetings from node version: v18.9.0
Hello, Console!
```

It's a JavaScript host. 😭

To someone who spends most of his time pursuing the portability and interoperability of wasm, this makes me cry a bit. 
However, things are not entirely hopeless, for not all heroes wear capes! **Steve Sanderson** from Microsoft has created a github project that is quite possibly the only tenuous thread by which the .NET (non-Blazor) WebAssembly ecosystem is hanging on: [the .NET WASI SDK](https://github.com/SteveSandersonMS/dotnet-wasi-sdk).

Let's see what it's like to build a `.wasm` file using Steve Sanderson's WASI SDK.

```
dotnet new console -o MyFirstWasiApp
cd MyFirstWasiApp
dotnet add package Wasi.Sdk --prerelease
dotnet build
```

The first important (and very promising) thing is that we're creating a _regular_ console application. We can't see node.js or any JavaScript from where we're standing, so we're off to a good start. It's worth pointing out that, at least on my Mac, the compiled output from hello world is `9MB`. Compared to Rust's average of `1MB` and smaller, that seems positively enormous. I also didn't see any size shrink between Release and Debug, but the WASI SDK is still experimental, so I suspect this will shrink over time.

ℹ️ **BUT**, one more thing before moving on. It is important to note that the way this stuff works is that the entire .NET Framework core and its runtime is embedded into the `.wasm` module (you can actually see the `dll`s crammed into a `data` section if you open the file up). So while we can expect things to get smaller and more optimized over time, I don't think we'll ever see .NET `.wasm` files approach the smaller relative size of Rust and Zig binaries because those languages don't require a garbage collector, etc.

In the interest of exploration, I wonder what happens when we try and do `dotnet run` (I'm assuming it should run like any other console/stdio-based WASI module).

```
dotnet run
Unhandled exception: System.ComponentModel.Win32Exception (2): An error occurred trying to start process 'wasmtime' with working directory '/Users/kevin/lab/dotnet/MyFirstWasiApp'. No such file or directory
```

Well, that's unfortunate. Looks like the run command is tightly coupled to having the `wasmtime` binary in your path. This is actually a good time for me to point out another area of high friction that I've found with .NET (though the problem exists in TinyGo as well): _lack of runtime interoperability_.

During a day of playing around with building all kinds of different freestanding WASI modules (yes, you can actually do this with the .NET WASI SDK!), I ran into a pretty thorny problem. At times, I would be able to get something to work when using a `wasmtime` host, but it would not work when using `wasmer` or `wasm3` hosts. Conversely, sometimes things would break via `wasmtime` that didn't break via `wasmer`.

_But what about **wasmCloud**?_ When will be able to build .NET actors in wasmCloud? Technically, it's feasible today, but with a giant asterisk ⚠️. It required me creating an elaborate Rube Goldberg machine made up of duct tape, straws, bailing wire, and a couple pieces of chewing gum. I had to hand-craft some free-range organic (antibiotic free!) C header files because you can't control import/export labels from inside a C# file (yet).

There is also absolutely no sign of work beginning in .NET on support for the component model (not to be confused with the `System.ComponentModel` namespace, which has been around since the dinosaurs). Even when the .NET wasm developer experience gets to a point that feels low-friction, it will probably not support components yet. We're definitely going to have to wait (and put in some effort and contribute!) to see `wit`-style support in a .NET project.

We're _almost_ to the first real MVP. I can feel it in these old bones that have been writing C# code since before the .NET Framework was even called .NET. My worry is that not enough people will be vocal enough about the high friction in building _freestanding_, _interoperable_, _standards-compliant_ WASI modules because if all anyone is looking at is the production and consumption loop through Blazor, they'll think there's absolutely nothing wrong with .NET's WebAssembly support.

The only call to action I ask is that we continue to be vocal. Show up in community meetings and on pull requests and RFCs and subreddits and represent the voice of the community that demands we stay true to the original portability and interoperability goals of WebAssembly while still improving the developer experience _and_ growing the community in an inclusive and welcoming way.
