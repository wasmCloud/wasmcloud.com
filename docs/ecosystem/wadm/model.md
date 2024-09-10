---
title: 'Defining Applications'
date: 2020-01-19T00:00:00+00:00
icon: 'ti-map' # themify icon pack : https://themify.me/themify-icons
description: 'Declaring your application models'
type: 'docs'
sidebar_position: 2
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
    description: 'This is my app'
spec: ...
```

wadm considers the `name` field to be a _globally unique value_, and the version number to follow [semantic versioning](https://semver.org/) conventions, though we only enforce that it looks like a semantic version - _we have no way to detect if you've produced a breaking change in a patch release_.

When application specifications are stored, they are keyed by name and a history of all versions is maintained, with the _most recently pushed_ version being considered the newest. We do not make assumptions about whether one version string (e.g. is `v1.10` is newer than `v1.1`?) is newer or older than any other. Version history is based purely on time of storage.

## Components

While OAM allows us to define any component in a specification, there are only a few components with which wadm is concerned:

- `component` - represents a specification of a component
- `capability` - represents a specification of a capability provider

Within the `components` field of a specification, you define an application component as follows:

```yaml
spec:
  components:
    - name: echo
      type: component
      properties:
        image: wasmcloud.azurecr.io/echo:0.3.8
        id: echo
        config:
          - name: default-language
            properties:
              lang: en-US
      traits: ...
```

The `image` property of the `component` component contains a file reference, an OCI image reference URL, or a Bindle image reference. The `id` property is an optional unique identifier you can assign your component. Generally, unless you have a reason to, it's recommended to omit the `id` property and let wadm assign a generated identifier for you which is a combination of the manifest name and the component name. Configuration specified here for the component will be available to the component at runtime via the [wasi-runtime-config](https://github.com/WebAssembly/wasi-runtime-config) interface.

To launch a component from a local file, you should prefix the path with `file://`, as follows:

```yaml
spec:
  components:
    - name: echo
      type: component
      properties:
        image: file:///Users/wasmcloud/echo/build/echo_s.wasm
      traits: ...
```

:::info
When launching a component from a local file, ensure that the environment variable `WASMCLOUD_ALLOW_FILE_LOAD=true` is set when you launch wasmCloud. This is the default for hosts running with `wash up`. Only absolute paths are supported, since clients cannot reliably assume which directory the target host was started from. When running hosts locally with `wash up` for development, however, it is possible to use relative paths (which is converted to an absolute path) for convenience.
:::

To define a **capability provider**, we include a `capability` component, as follows:

```yaml
- name: keyvalue
      type: capability
      properties:
        image: ghcr.io/wasmcloud/keyvalue-redis:0.27.0
        id: kvredis
        config:
          - name: url
            properties:
              url: redis://127.0.0.1:6379
```

Just like when manipulating a lattice _imperatively_, the thing that differentiate one capability provider from another is its `id`, which can be specified here or ommitted in favor of wadm generating an identifier (recommended.). Configuration can be specified here for the provider and it will be accessible at runtime via the data passed to the provider, see the [keyvalue-redis](https://github.com/wasmCloud/wasmCloud/blob/main/crates/provider-keyvalue-redis/src/lib.rs#L64) provider for example usage.

## Traits

Traits are, as their name applies, metadata associated with a `component`. The OAM trait system is completely extensible, so as wadm gains more functionality, it can support more traits. Right now, the following traits are supported:

- `spreadscaler`
- `daemonscaler`
- `link`

### Spread Scaler

The `spreadscaler` trait contains a specification for how you would like to scale a set number of instances of a component. We call it a _spread_ scaler because you declare how you would like the instances of that component spread across the hosts within your lattice by specifying targets with host _labels_. You can think of this like affinity and anti-affinity rules combined with a scale specification.

Take a look at the following sample `spreadscaler` spec:

```yaml
traits:
- type: spreadscaler
    properties:
    replicas: 4
    spread:
        - name: eastcoast
          weight: 80
          requirements:
            zone: us-east-1
        - name: westcoast
          weight: 20
          requirements:
            zone: us-west-1
```

This definition states that, for this component (a spread scaler can apply to a `component` or `capability`), you want a total of 4 instances, with 80% of them going to hosts with the `zone` label set to `us-east-1` and 20% of them going to hosts with the `zone` label set to `us-west-1`. Because this system uses labels as selectors, and you can set any arbitrary label on your hosts, you can define practically any conditions for the spread rules.

If you leave the `requirements` section blank then all hosts will be considered possible targets for that component. You can also leave the `spread` definition off so you can simply state that you would like `n` replicas and you don't care where or how you get them:

```yaml
traits:
- type: spreadscaler
    properties:
    replicas: 4
```

⚠️ _NOTE_: if you define a label/value pair requirement and wadm is unable to find hosts that match this constraint, it will consider this a deployment failure and will _not_ fall back to arbitrary placement.

### Daemon Scaler

The `daemonscaler` trait is an alternative to the `spreadscaler` trait. It is a trait that deploys a certain number of instances of a component on every host in your lattice that matches specified labels. Take a look at the following sample `daemonscaler` spec:

```yaml
traits:
- type: daemonscaler
    properties:
      replicas: 4
      spread:
          - name: eastcoast
          requirements:
              zone: us-east-1
          - name: westcoast
          requirements:
              zone: us-west-1
```

Note that this looks similar to the above `spreadscaler` spec, but the `daemonscaler` is responsible for running a certain number of instances of a component on _every host_ that matches the label requirements. So, instead of running **4** total instances, it will run **4** instances on every host that either has the `zone` label set to `us-east-1` or `us-west-1`. If you leave off the `spread` key entirely, it will run the specified number of instances on _every host_ in your lattice.

:::info[For the Kubernetes developer]
The `daemonscaler` works just like a Kubernetes DaemonSet, spreading components across all hosts that match the label requirements.
:::

### Links

The `link` trait links two components together with a set of configuration values.

```yaml
# Link to KVredis with local connection
- type: link
  properties:
    target: keyvalue
    namespace: wasi
    package: keyvalue
    interfaces:
      - atomics
      - store
    target_config:
      - name: redis-connect-local
        properties:
          URL: redis://127.0.0.1:6379
```

The value of the `target` field is a _component_ whose `name` field matches that. The `values` is a simple key-value map that will be passed as link definition configuration data at deployment time. Note that the value here **must be a string**, so if you're passing a value like "false" or "125" ensure that you wrap it in single or double quotes.

:::info[Target vs source configuration]
Links include both a `target_config` and a `source_config` field for providing configuration. This can be used to provide configuration values to just the component that needs them. For example, in the above snippet, the _target_ of the link is the Redis provider which needs to know what URL to connect to, and the _source_ of the link is a component that doesn't need that configuration. This is very important for security sensitive configuration that you don't want to expose unnecessarily to additional components.
:::

### Putting it All Together

So far we've seen bits and pieces of the application specification YAML. The following is an example of a complete manifest:

```yaml
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: kvcounter-rust
  annotations:
    version: v0.0.1
    description: 'Kvcounter demo'
spec:
  components:
    - name: kvcounter
      type: component
      properties:
        image: file://./build/http_hello_world_s.wasm
      traits:
        # Govern the spread/scheduling of the component
        - type: spreadscaler
          properties:
            replicas: 1
        # Link to KVredis with local connection
        - type: link
          properties:
            target: keyvalue
            namespace: wasi
            package: keyvalue
            interfaces:
              - atomics
              - store
            target_config:
              - name: redis-connect-local
                properties:
                  URL: redis://127.0.0.1:6379

    # Add a capability provider that mediates HTTP access
    - name: httpserver
      type: capability
      properties:
        image: wasmcloud.azurecr.io/httpserver:0.19.1
      traits:
        # Link the HTTP server, and inform it to listen on port 8080
        # on the local machine
        - type: link
          properties:
            target: http-hello-world
            namespace: wasi
            package: http
            interfaces:
              - incoming-handler
            source_config:
              - name: listen-config
                properties:
                  ADDRESS: 127.0.0.1:8080
    # Add a capability provider that interfaces with the Redis key-value store
    - name: keyvalue
      type: capability
      properties:
        image: ghcr.io/wasmcloud/keyvalue-redis:0.27.0
```
