---
title: "Creating a Bindle for a Provider"
date: 2021-12-29T11:02:05+06:00
weight: 3
draft: false
---

Currently, there is no tooling outside of the `bindle` CLI for creating a bindle for your provider.
This will be added to `wash` in the future as we solidify our Bindle support. These instructions
show how to manually assemble a bindle for a provider.

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
name = "wasmcloud.dev/httpserver"
version = "0.14.7"
description = "A wasmCloud maintained HTTP server capability provider that implements the wasmcloud:httpserver contract"
authors = ["The wasmCloud Team"]

[annotations]
"wasmcloud.dev/type" = "provider"
```

For more information on Bindle naming and IDs, see the relevant information in the [Bindle
docs](https://github.com/deislabs/bindle/blob/main/docs/reference-spec.md#bindle-name-and-version).
Currently, we do not actually use the `wasmcloud.dev/type` annotation, but we likely will in the
future.

## Adding Parcels

A Provider bindle must contain the `claims.jwt` for a provider as well as all of the binaries needed
for that provider (generally one per supported OS + ARCH combination). It is recommended that you
put all of these files in a directory for ease of use when generating the
[labels](https://github.com/deislabs/bindle/blob/main/docs/label-spec.md). You can then run the
following command to get all of the necessary labels:

```console
$ ls subdir/ | xargs -I {} bindle generate-label subdir/{}
sha256 = 'd8131f5241fb0ddeac642e714136ea8356288c4a2fc02c28ebd154d9c45303f0'
mediaType = 'application/octet-stream'
name = 'aarch64-linux.bin'
size = 13382200

sha256 = 'c8d75a703d7e967a17e5e41ec968bd1bb0aa5ca1df4301404fb171555af6620c'
mediaType = 'application/octet-stream'
name = 'aarch64-macos.bin'
size = 7568072

...
```

Once you have these labels, each one should be added as a separate object of the `parcel` array
(beneath the already existing content in `invoice.toml`). Note that you must also specify a set of
[features](https://github.com/deislabs/bindle/blob/main/docs/label-spec.md#the-feature-section) and
[conditions](https://github.com/deislabs/bindle/blob/main/docs/invoice-spec.md#parcels-and-conditions).
The `conditions` field will be the same for all of the binaries as it specifies that the given
parcel is part of the group of possible binaries to select from. For the claims file, the `memberOf`
array should be set to the single value of `jwt`. The features field must contain two keys: `arch`
and `os` that match the given architecture and operating system for each binary. An example of this
is below:

```toml
[[parcel]]
[parcel.label]
sha256 = 'd8131f5241fb0ddeac642e714136ea8356288c4a2fc02c28ebd154d9c45303f0'
mediaType = 'application/octet-stream'
name = 'aarch64-linux.bin'
size = 13382200
[parcel.label.feature.wasmcloud]
arch = "aarch64"
os = "linux"

[parcel.conditions]
memberOf = ["binaries"]

[[parcel]]
[parcel.label]
sha256 = 'dd956beef11c1deba32f85ee2dbdaaade8923afd0956ab1c370041431432e194'
mediaType = 'application/octet-stream'
name = 'claims.jwt'
size = 1191

[parcel.conditions]
memberOf = ["jwt"]
```

NOTE: The group names and the `parcel.label.feature.wasmcloud` feature are REQUIRED for use in
wasmCloud

## Adding groups

At the very end of the `invoice.toml`, you'll need to actually define the two groups the parcels are
referring to. This content can be copy/pasted verbatim:


```toml
[[group]]
name = "binaries"
required = true
satisfiedBy = "oneOf"

[[group]]
name = "jwt"
required = true
satisfiedBy = "allOf"
```

## Pushing to the server

Once you have finished your invoice, you can push everything to the server. There are two options
for doing so. It is highly recommended that for real use cases (basically if you are doing anything
outside of simple testing) that you sign the invoice using `bindle sign`. More information on
signing can be found in the [Bindle
docs](https://github.com/deislabs/bindle/blob/main/docs/signing-spec.md).

### Method 1: Pushing Individual Files

The first thing you'll need to push is your invoice:

```console
$ bindle push-invoice invoice.toml 
Invoice wasmcloud.dev/httpserver/0.14.7 created
```

You'll want to copy the bindle ID (`wasmcloud.dev/httpserver/0.14.7`) from above to use in the next
commands.

Once pushed, you can push all your binary files like so (assuming all of your binaries have an
extension of `.bin`):

```console
$ ls subdir/*.bin | xargs -I {} bindle push-file wasmcloud.dev/httpserver/0.14.7 {} 
```

Then you can push the claims:

```console
$ bindle push-file wasmcloud.dev/httpserver/0.14.7 subdir/claims.jwt 
```

Whew! You made it!

### Method 2: Creating a standalone bindle

It is worth mentioning that there is an alternate option to pushing that will not be fully
documented here called a "Standalone Bindle." This is likely the intermediate format we will use in
the future when adding support to `wash`. If you create a standalone bindle, you are able to do a
simple `bindle push <bindle_id>` to push all of the data at once to a bindle server. For more
information on how a standalone bindle is constructed, see the [Bindle
docs](https://github.com/deislabs/bindle/blob/main/docs/standalone-bindle-spec.md).

## A full example

Below is a full invoice example converted from `wasmcloud.azurecr.io/httpserver:0.14.7` for
reference:

```toml
bindleVersion = "1.0.0"

[bindle]
name = "wasmcloud.dev/httpserver"
version = "0.14.7"
description = "A wasmCloud maintained HTTP server capability provider that implements the wasmcloud:httpserver contract"
authors = ["The wasmCloud Team"]

[annotations]
"wasmcloud.dev/type" = "provider"

[[parcel]]
[parcel.label]
sha256 = 'd8131f5241fb0ddeac642e714136ea8356288c4a2fc02c28ebd154d9c45303f0'
mediaType = 'application/octet-stream'
name = 'aarch64-linux.bin'
size = 13382200
[parcel.label.feature.wasmcloud]
arch = "aarch64"
os = "linux"

[parcel.conditions]
memberOf = ["binaries"]

[[parcel]]
[parcel.label]
sha256 = 'c8d75a703d7e967a17e5e41ec968bd1bb0aa5ca1df4301404fb171555af6620c'
mediaType = 'application/octet-stream'
name = 'aarch64-macos.bin'
size = 7568072
[parcel.label.feature.wasmcloud]
arch = "aarch64"
os = "macos"

[parcel.conditions]
memberOf = ["binaries"]

[[parcel]]
[parcel.label]
sha256 = 'd5233ab1ae4b6487f7e7a0d357b3212f375b545c83bd11e2c73930f50b91c0c8'
mediaType = 'application/octet-stream'
name = 'armv7-linux.bin'
size = 12506760
[parcel.label.feature.wasmcloud]
arch = "armv7"
os = "linux"

[parcel.conditions]
memberOf = ["binaries"]

[[parcel]]
[parcel.label]
sha256 = '2f2970224f2adb7fc6d7953f5acb531b8d75c0120b7ac688a7b39f86bb0c22c3'
mediaType = 'application/octet-stream'
name = 'x86_64-linux.bin'
size = 14164432
[parcel.label.feature.wasmcloud]
arch = "x86_64"
os = "linux"

[parcel.conditions]
memberOf = ["binaries"]

[[parcel]]
[parcel.label]
sha256 = '9c386116e3d32b32d5d994200c4a78c78dbe051113beb2af1f4158465ac1e3a5'
mediaType = 'application/octet-stream'
name = 'x86_64-macos.bin'
size = 8894896
[parcel.label.feature.wasmcloud]
arch = "x86_64"
os = "macos"

[parcel.conditions]
memberOf = ["binaries"]

[[parcel]]
[parcel.label]
sha256 = '6c0740c4dbcd0f3f08a857a3a4c84fc2bb981936ab44f602efbccf8bd444a0c3'
mediaType = 'application/octet-stream'
name = 'x86_64-windows.bin'
size = 23891684
[parcel.label.feature.wasmcloud]
arch = "x86_64"
os = "windows"

[parcel.conditions]
memberOf = ["binaries"]

[[parcel]]
[parcel.label]
sha256 = 'dd956beef11c1deba32f85ee2dbdaaade8923afd0956ab1c370041431432e194'
mediaType = 'application/octet-stream'
name = 'claims.jwt'
size = 1191

[parcel.conditions]
memberOf = ["jwt"]

[[group]]
name = "binaries"
required = true
satisfiedBy = "oneOf"

[[group]]
name = "jwt"
required = true
satisfiedBy = "allOf"
```
