---
title: "Host Manifests"
date: 2018-12-29T11:02:05+06:00
weight: 9
draft: false
---

A _host manifest_ contains a list of actors and providers that you would like to start on a given host. The manifest file is an _imperative_ set of instructions, and so should not be considered either safe or idempotent to run multiple times. Think of the manifest file as a shortcut for invoking `wash ctl` over and over again.

The following describes the contents of a host manifest:

* `actors` - This section contains a list (yaml or json `array`) of actor _references_. An actor reference in a host manifest _must_ be the OCI image reference URL of the actor as stored in an OCI registry. This section is mandatory, so if you do not wish to start any actors, supply the format equivalent of an empty list/array. Since the target host could be anywhere, the only way for that remote host to reliably locate your actor is through an OCI reference.
* `capabilities` - This section contains a list of capability provider _descriptions_. A capability provider description is a structure that provides the minimal amount of information required for the wasmCloud host to load and start a capability provider. Capability descriptions contain the following fields:
  * `image_ref` - This is a required field that contains the OCI image reference of a capability provider. If you want to launch a local capability provider via manifest, then you'll have to ensure that it's stored in a local registry and you provide the local registry URL.
  * `link_name` - This field is optional and contains the name of the provider as a target for links. If you leave this value out of the manifest, wasmCloud will use the default link name of `default`.  This field is only necessary to distinguish between two configurations of the same provider. 

### Applying a Host Manifest

A host manifest file can be applied to a specific target host by running the `wash ctl apply` command. For more information on this command, run `wash ctl apply --help`. Wash will attempt to use the _control interface_ to communicate with the specified remote host and issue the appropriate _start_ commands for the manifest's actors and providers.

#### Environment Variable Substitution

Within the YAML manifest files, you can optionally use environment variable substitution syntax that lets you supply a default value that will be overridden when a named environment variable has been provided. That syntax looks as follows:

```shell
${BROKERCHANNEL_ACTOR:MAP7EXS72YJ5Z6U5AJ6IMYIRVMRJRZJBLVTC6H4E552K7SJDRYBPA3YF}
```

Here the environment variable `BROKERCHANNEL_ACTOR` will be used, otherwise the public key `MAP....F` will be used.

### Example Manifest (YAML)

The following is an example manifest that describes a subset of functionality contained in the "wasmCloud chat" reference/demo application.

```yaml
---
actors:
    - wasmcloud.azurecr.io/echo:0.3.4    
capabilities:
    - image_ref: wasmcloud.azurecr.io/nats:0.14.0
      link_name: frontend
    - image_ref: wasmcloud.azurecr.io/nats:0.14.0
      link_name: backend 
```

Remember that the providers won't actually be "active" until you've supplied the appropriate link definitions. You can supply them either before or after you apply the manifest.

### ⚠️ Caveats

As mentioned above, manifest files are _imperative_. They are basically shortcuts for `wash ctl` instructions. You need to be aware that applications could fail when attempting to apply the same manifest twice (e.g. the same provider+link name cannot be running on a single host more than once).
