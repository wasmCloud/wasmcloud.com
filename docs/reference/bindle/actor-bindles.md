---
title: "Creating a Bindle for an Actor"
date: 2021-12-29T11:02:05+06:00
weight: 4
draft: false
---

Currently, there is no tooling outside of the `bindle` CLI for creating a bindle for your actor.
This will be added to `wash` in the future as we solidify our Bindle support. These instructions
show how to manually assemble a bindle for an actor.

## Prerequisites

Before doing these steps, you'll need to install the `bindle` CLI by downloading it from the
[releases page](https://github.com/deislabs/bindle/releases).

After downloading `bindle`, set the `BINDLE_URL` environment variable to the bindle server of your
choosing:

```console
$ export BINDLE_URL=http://localhost:8080/v1
```

## Creating your Invoice

First off, you'll need to create an invoice. Create a new file called `invoice.toml` and put the
following content in it, switching out `name` and `version` with the values for your specific
project as well as updating the `description` and `authors` field:

```toml
bindleVersion = "1.0.0"

[bindle]
name = "wasmcloud.dev/echo"
version = "0.3.2"
description = "A wasmCloud maintained echo actor for testing and tire kicking"
authors = ["The wasmCloud Team"]

[annotations]
"wasmcloud.dev/type" = "actor"
```

For more information on Bindle naming and IDs, see the relevant information in the [Bindle
docs](https://github.com/deislabs/bindle/blob/main/docs/reference-spec.md#bindle-name-and-version).
Currently, we do not actually use the `wasmcloud.dev/type` annotation, but we likely will in the
future.

## Adding the actor parcel

After building your signed actor, you can generate a label for it by running:

```console
$ bindle generate-label build/echo_s.wasm
sha256 = '21c1f194b124db7c2f0aebfba6df557f9625e525ff231b5a295e1187a79c5e5f'
mediaType = 'application/wasm'
name = 'echo_s.wasm'
size = 1842409
```

Once you have this label, you can add it as a separate object of the `parcel` array (beneath the
already existing content in `invoice.toml`) like so:

```toml
[[parcel]]
[parcel.label]
sha256 = '21c1f194b124db7c2f0aebfba6df557f9625e525ff231b5a295e1187a79c5e5f'
mediaType = 'application/wasm'
name = 'echo.wasm'
size = 1842409
```

## Pushing to the server

Once you have finished your invoice, you can push everything to the server. It is highly recommended
that for real use cases (basically if you are doing anything outside of simple testing) that you
sign the invoice using `bindle sign`. More information on signing can be found in the [Bindle
docs](https://github.com/deislabs/bindle/blob/main/docs/signing-spec.md).


The first thing you'll need to push is your invoice:

```console
$ bindle push-invoice invoice.toml 
Invoice wasmcloud.dev/echo/0.3.2 created
```

You'll want to copy the bindle ID (`wasmcloud.dev/echo/0.3.2`) from above to use in the next command
to push the actor:

```console
$ bindle push-file wasmcloud.dev/echo/0.3.2 build/echo_s.wasm 
```

Whew! You made it!

## A full example

Below is a full invoice example converted from `wasmcloud.azurecr.io/echo:0.3.2` for reference:

```toml
bindleVersion = "1.0.0"

[bindle]
name = "wasmcloud.dev/echo"
version = "0.3.2"
description = "A wasmCloud maintained echo actor for testing and tire kicking"
authors = ["The wasmCloud Team"]

[annotations]
"wasmcloud.dev/type" = "actor"

[[parcel]]
[parcel.label]
sha256 = '21c1f194b124db7c2f0aebfba6df557f9625e525ff231b5a295e1187a79c5e5f'
mediaType = 'application/wasm'
name = 'echo.wasm'
size = 1842409
```
