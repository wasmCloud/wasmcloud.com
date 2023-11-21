---
title: "Running the actor"
date: 2018-12-29T10:00:00+00:00
sidebar_position: 5
draft: false
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

In the [first getting started guide](/docs/tour/hello-world) of wasmCloud you deployed an actor using wadm via the `wash app deploy` command.
Now, we're going to start the actor "the long way" so that you can get a feel for all of the moving parts of the process. Our tooling documentation should help you get actors started more easily, once you've been through this guide.

We assume you've already [installed](/docs/installation.mdx) wash, the wasmCloud host, and necessary prerequisites.

### Build the actor

Building the actor is as easy as running `wash build` in the project's root directory.
This will compile the actor using your local toolchain and automatically [sign it](https://wasmcloud.com/docs/reference/host-runtime/security) for you. The `wasmcloud.toml` file that comes with the newly generated project lists claims for the actor including `wasmcloud:httpserver`, so it can work with the HTTP Server capability provider.

### Launch the Actor

The simplest way to get an actor running is by starting it from a locally built file. wasmCloud has support for starting built and signed actors from absolute paths in addition to starting from OCI registries.

Use `wash build -o json` to get the absolute path to the locally built actor. You can then use `wash` to start the actor.

```bash
# Replace the path below with the path to your actor
wash start actor file:///Users/wasmcloud/hello/build/hello_s.wasm
```

If you're running the wasmCloud dashboard, you can take a look at your running actor by visiting [localhost:3000](http://localhost:3000) in your browser. Alternatively, you can use `wash` to query the inventory of your running hosts:

```bash
wash get inventory
```

### Start the web server

We know our new actor needs a web server, so let's start the HTTP server capability provider.

```bash
wash start provider wasmcloud.azurecr.io/httpserver:0.19.1
```

### Add a link definition

With both the provider and the actor running, the next step is to _link_ the two. This provides a set of configuration values that is unique for each actor's use of a provider. To link your actor, you'll need the actor's public key. You can get that by inspecting your local actor file and making note of the `Module` key in the output (yours will be different from the output below).

```bash
wash inspect ./build/hello_s.wasm
                              hello - Module
  Account       ACVKDPI2B3GFBAKURMYXBBDDTMJR3UQ7QLMAGE5Z6NNMTLAR276MZ2WF
  Module        MDLP5JLL7XMHGAYBUHGRBZHDVE4FIQLB6ONC2ZZG6HPNHPX6HZJ7EAJD
  Expires                                                          never
  Can Be Used                                                immediately
  Version                                                      0.1.0 (0)
  Call Alias                                                   (Not set)
                               Capabilities
  HTTP Server
                                   Tags
  None
```

Once you've got the actor's public key, you can export a `HELLO_ACTOR_ID` environment variable with that value and copy-and-paste the link command:

<Tabs>
<TabItem value="unix" label="Unix" default>

```shell
# Paste your actor ID after the `=` below (with no space after the `=`)
export HELLO_ACTOR_ID=
```

```shell
wash link put ${HELLO_ACTOR_ID} VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M wasmcloud:httpserver address=0.0.0.0:8087
```

  </TabItem>
  <TabItem value="powershell" label="Powershell" default>

```powershell
# Paste your actor ID after the `=` below (with a space after the `=`)
$env:HELLO_ACTOR_ID =
```

```powershell
wash link put $env:HELLO_ACTOR_ID VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M wasmcloud:httpserver address=0.0.0.0:8087
```

  </TabItem>
</Tabs>

At this point your HTTP server capability provider has been notified that a link definition was created, and it started the corresponding web server listening on port `8087`. You can now hit that endpoint and exercise the code you just wrote:

```shell
curl localhost:8087
```

and you should get the response:

```text
Hello World
```

The actor accepts an optional parameter `name`, and uses it to change the greeting. (Notice the quotes around the url below).

```shell
curl "localhost:8087?name=Carol"
```

The response should be

```text
Hello Carol
```

_**Congratulations!**_ You've successfully created and run your first actor. Welcome to the world of boilerplate-free, simple distributed application development in the cloud, browser, and everywhere in between.

Let's make a slight modification to the code, so you can see what it's like to go through a development iteration to compile and update the running code. Don't worry - this will be pretty quick.
