---
title: "Wadm App Model"
date: 2022-09-08T11:02:05+06:00
weight: 2
draft: false
---

The **w**asmCloud **A**pplication **D**eployment **M**anager uses the [Open Application Model](https://oam.dev/) to define application specifications. Because this specification is extensible and platform agnostic, it makes for an ideal way to represent applications with metadata specific to wasmCloud. Don't worry if OAM seems overwhelming, you don't need to know much about it. We're using it as a way of defining application components in a flexible way that's familiar to a lot of people who have been working in the cloud space.

In this model, an application `specification` is a set of metadata about the app, as well as a list of `components`. Each component within an application is decorated with various `traits`. These core building blocks allow us to make it very easy to define incredibly powerful deployments. wasmCloud defines a number of traits that are specific to our hosts, but let's go through the model from top to bottom.

## Application
The application is the top-most definition in an OAM specification. The metadata about the application that we're mostly concerned with are the name and version:

```yaml
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: my-example-app
  annotations:
    version: v0.0.1
    description: "This is my app"
spec:
  ...
```

wadm considers the `name` field to be a _globally unique value_, and the version number to follow [semantic versioning](https://semver.org/) conventions, though we only enforce that it looks like a semantic version - _we have no way to detect if you've produced a breaking change in a patch release_.

When application specifications are stored, they are keyed by name and a history of all versions is maintained, with the _most recently pushed_ version being considered the newest. We do not make assumptions about whether one version string (e.g. is `v1.10` is newer than `v1.1`?) is newer or older than any other. Version history is based purely on time of storage.

## Components

While OAM allows us to define any component in a specification, there are only a few components with which wadm is concerned:
* `actor` - represents a specification of an actor
* `capability` - represents a specification of a capability provider

Within the `components` field of a specification, you define an `actor` as follows:

```yaml
spec:
  components:
    - name: echo
      type: actor
      properties:
        image: wasmcloud.azurecr.io/echo:0.3.5
      traits:
        ...
```

The `image` property of the `actor` component contains an OCI (or bindle) image reference URL. When you attempt to store this model, wadm will reach out to the artifact repository and attempt to pull some metadata about that image (such as its primary key, embedded security information, etc). This means that storing application specifications with invalid/unreachable OCI references is not allowed.

To define a capability provider, we include a `capability` component, as follows:

```yaml
    - name: webcap
      type: capability
      properties:
        contract: wasmcloud:httpserver
        image: wasmcloud.azurecr.io/httpserver:0.13.1
        link_name: default
```

Just like when manipulating a lattice _imperatively_, the things that differentiate one capability provider from another are its contract, its public key (which we obtain by looking up the `image`), and its link name.

## Traits
Traits are, as their name applies, metadata associated with a `component`. The OAM trait system is completely extensible, so as wadm gains more functionality, it can support more traits. Right now, the following traits are supported:

* `spreadscaler`
* `linkdef`

### Spread Scaler
The `spreadscaler` trait contains a specification for how you would like to scale a set number of instances of an actor. We call it a _spread_ scaler because you declare how you would like the instances of that actor spread across the hosts within your lattice by specifying targets with host _labels_. You can think of this like affinity and anti-affinity rules combined with a scale specification.

Take a look at the following sample `spreadscaler` spec:

```yaml
traits:
- type: spreadscaler
    properties:
    replicas: 4
    spread:
        - name: eastcoast
        requirements:
            zone: us-east-1
        weight: 80
        - name: westcoast
        requirements:
            zone: us-west-1
        weight: 20
```

This definition states that, for this component (a spread scaler can apply to an `actor` or `capability`), you want a total of 4 instances, with 80% of them going to hosts with the `zone` label set to `us-east-1` and 20% of them going to hosts with the `zone` label set to `us-west-1`. Because this system uses labels as selectors, and you can set any arbitrary label on your hosts, you can define practically any conditions for the spread rules.

If you leave the `requirements` section blank then all hosts will be considered possible targets for that component. You can also leave the `spread` definition off so you can simply state that you would like `n` replicas and you don't care where or how you get them:

```yaml
traits:
- type: spreadscaler
    properties:
    replicas: 4    
```

⚠️ _NOTE_: if you define a label/value pair requirement and wadm is unable to find hosts that match this constraint, it will consider this a deployment failure and will _not_ fall back to arbitrary placement.

### Link Definition
The `linkdef` trait links two components together with a set of configuration values.

```yaml
- type: linkdef
    properties:
    target: webcap
    values:
        port: 8080
```

Quite possibly one of the best features of specifying link definitions in a wadm file as opposed to using imperative `wash` commands is that you do _not need to use the source or target's public key_. If you've used `wash` to specify link definitions before, you know the syntax can be verbose.

The value of the `target` field is a _component_ whose `name` field matches that. The `values` is a simple key-value map that will be passed as link definition configuration data at deployment time.

### Putting it All Together
So far we've seen bits and pieces of the application specification YAML. The following yaml is from one of our [sample applications](https://github.com/wasmCloud/examples/blob/main/actor/kvcounter/wadm.yaml), the key-value counter:

```yaml
# This is a full example of how to run the kvcounter actor exposed with an HTTP server. Using this
# example requires you to have a Redis server running locally (though the linkdef can be modified to
# use a Redis server you have running elsewhere) and WADM running:
# https://github.com/wasmCloud/wadm/tree/main/wadm. You can deploy this example with two simple
# commands:
#
# `wash app put wadm.yaml`
# `wash app deploy kvcounter 0.0.1`

apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: kvcounter
  annotations:
    version: v0.0.1
    description: "wasmCloud Key Value Counter Example"
spec:
  components:
    - name: kvcounter
      type: actor
      properties:
        image: wasmcloud.azurecr.io/kvcounter:0.3.4
      traits:
        - type: linkdef
          properties:
            target: redis
            values:
              URL: redis://0.0.0.0:6379/
        - type: linkdef
          properties:
            target: httpserver
            values:
              ADDRESS: 127.0.0.1:8081
        - type: spreadscaler
          properties:
            replicas: 1

    - name: httpserver
      type: capability
      properties:
        image: wasmcloud.azurecr.io/httpserver:0.16.2
        contract: wasmcloud:httpserver
      traits:
        - type: spreadscaler
          properties:
            replicas: 1

    - name: redis
      type: capability
      properties:
        image: wasmcloud.azurecr.io/kvredis:0.16.3
        contract: wasmcloud:keyvalue
      traits:
        - type: spreadscaler
          properties:
            replicas: 1
```



⚠️ _NOTE_: while wadm can "claim" resources like actors and providers and differentiate between wadm-managed versus unmanaged, this is not so with link definitions. If you manually push new link definition information that overrides or conflicts with the link definitions in your wadm spec, you could experience unexpected behavior until wadm corrects for it. You must take extreme care that wadm-managed link definitions don't conflict with external link definitions.