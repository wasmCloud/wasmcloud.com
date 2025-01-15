---
title: 'Workflows'
date: 2018-12-29T11:02:05+06:00
sidebar_position: 1
draft: false
description: 'Common development loops'
---

As a developer using wasmCloud, there are a number of common day-to-day workflows that you will experience.

The following is a list of developer workflows _sorted_ from **_most to least common_**.

## Building Components

The most common thing application developers will do is build [components](/docs/concepts/components). Components encompass pure business logic in wasmCloud, and only communicate with non-functional requirements through capability providers and abstract [interfaces](/docs/concepts/interfaces).

Once you've established a dependency on a library that exposes the interface abstraction you're looking for, you can start your iteration loop.

The developer's _iteration loop_ for building a component looks something like this:

1. Make code changes
1. Compile and sign the WebAssembly module, creating a `_s.wasm` file (using `wash build` in a component project)
1. Test the module
   1. In the CLI
      1. Use the `wash dev` command to automatically watch component files for changes
      1. Script `wash call` commands to invoke the component
      1. Modify your component code, run `wash build` to recompile and re-sign the component, repeat the above step
1. _Repeat_

As of wash 0.18.0, there is now a `wash dev` command that automates this process for you. See the [Customizing the component](/docs/developer/components/update) section for more details on how to use it.

## Building Providers

The workflow for building a capability provider is similar to that of building a component. Once you've located and declared a dependency on the _interface_ implemented by your capability provider, the _iteration loop_ looks something like this:

1. Make code changes
1. Execute tests (`make test`)
1. Compile native executable binary
1. Create and sign JWT
1. Embed JWT and executable in a `.par.gz` (provider archive) file. (Steps 3-5 can be done with the single command `make` using the generated project Makefiles).
1. Publish `.PAR` file to local or remote OCI registry (`make push`)
1. Test/Utilize the provider in the context of a host/lattice
1. _Repeat_

## Running a local OCI registry

While it isn't called out as a specific pre-requisite, _many_ of the steps in the developer iteration loops involve interacting with an OCI registry. Unless you've got a public one that you can use, you'll likely want to use a local one for testing.

To start a local OCI registry, download the [sample Docker Compose file](https://github.com/wasmCloud/wasmCloud/blob/main/examples/docker/docker-compose-full.yml) into the current folder and run

```bash
docker compose up -d registry
```

Once it's running, you can push components and capability providers to the registry using `wash push`. For example:

```bash
wash push localhost:5000/my component:0.1.0 ./build/my_ component_s.wasm
wash push localhost:5000/myprovider:0.1.0 ./build/my_provider.par.gz
```

:::info
The `wash reg push` subcommand was renamed to `wash push`.
See [the wash command ref componenting RFC](https://github.com/wasmCloud/wash/issues/538) for more information and to provide feedback
:::

## Allowing unauthenticated OCI registry access

The wasmCloud host runtime will, by default, require that all OCI references use authentication in order to resolve and download. This is a security measure that is enabled by default to keep the system as secure as possible.

However, if you're running the local docker-supplied registry with its default settings, that registry will not have any authentication requirements. If you want your wasmCloud host to be able to talk to this registry, you'll need to enable unauthenticated OCI registry access.

This can be done by setting the environment variable `WASMCLOUD_OCI_ALLOWED_INSECURE` to include the URL of your local registry, e.g. `localhost:5000`. You can either supply this as an environment variable directly when you start a local wasmCloud host via `iex` or the release binary, or you can modify your shell profile to always set this variable on your development workstation.

## Purging the OCI cache

The wasmCloud host runtime caches the files that it receives from OCI registries beneath whatever `temp` directory your operating system prefers. Because images in an OCI registry are supposed to be _immutable_ (another reason we recommend against using `latest` when requesting an image version), the wasmCloud host has no reason to automatically purge or overwrite these files in the cache.

During your local development iterations, you will likely find yourself pushing the same file with the same OCI reference over and over again. In order for the wasmCloud host to see these changes, you'll need to _drain_ the wasmCloud host cache. This can be done by executing one of the variants of `wash drain`, such as `wash drain all`.

## Testing wadm manifests faster with `wash`

As of `wash` v0.29.0, deploying applications and iterative development has become much easier with the help of a few new commands.

### Validate wadm application manifests before deploying them

Misspelled interfaces, missing links, and other issues can be hard to find in a wadm application manifest.

To find potential issues *before* you `wash app deploy` your manifest, use `wash app validate`:

```console
wash app validate path/to/your/wadm.yaml
```

`wash app validate` will check for common issues and errors in your wadm manifest, and notify you of any issues.

### Start a host and deploy a wadm application manifest in one command

The easiest way to test a wadm application is to start a host, deploy the application, and start using it.

To quickly run a host and deploy a *single* wadm manifest, run `wash up` with `--wadm-manifest`:

```console
wash up --wadm-manifest path/to/your/wadm.yaml
```

When run this way, `wash up` will start a single host lattice as normal, but *also* deploy your provided manifest to the running lattice, so you can interact with your application as soon as possible.

### Easily deploy a wadm application manifest continuously

If you have your host running in a separate shell/terminal window and want to avoid having to constantly `wash app delete` in-between changes to your project and/or manifest, you can run `wash app deploy` with the `--replace` option:

```console
wash app deploy --replace path/to/your/wadm.yaml
```

Running `wash app deploy` with the `--replace` flag makes wash attempt to delete the application before attempting to deploy it.

Combine this with a tool like [`cargo watch`][cargo-watch] (in the Rust ecosystem) and you can continuously re-deploy your manifest any time your Rust project changes:

```console
cargo watch -- wash app deploy --replace path/to/your/wadm.yaml
```

[cargo-watch]: https://crates.io/crates/cargo-watch
