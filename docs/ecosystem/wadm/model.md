---
title: 'Defining Applications'
date: 2020-01-19T00:00:00+00:00
icon: 'ti-map' # themify icon pack : https://themify.me/themify-icons
description: 'Declaring your application models'
type: 'docs'
sidebar_position: 2
---

The **wasmCloud Application Deployment Manager** (`wadm`) uses the [Open Application Model](https://oam.dev/) to define application specifications. Because the OAM specification is extensible and platform-agnostic, it makes for an ideal way to represent applications with metadata specific to wasmCloud. 

:::note[OAM expertise not required]
You don't need to know much about OAM to use wasmCloud&mdash;we've adopted the spec as a way of defining applications in a flexible way that is familiar to many people who work with cloud native technologies.
:::

In this model, an application `specification` is a set of metadata about the application, as well as a list of `components`. In this context, we are following the OAM spec in using the term "component" to refer to **any entity that makes up an application**, and not specifically a WebAssembly component. (As we will see, the `type` field will help us distinguish WebAssembly components from other entities.)

Each component within an application is decorated with various `traits`. These core building blocks allow us to make it very easy to define incredibly powerful deployments. wasmCloud defines a number of traits that are specific to our hosts, but let's go through the model from top to bottom.

## Application

The application is the top-most definition in an OAM specification. The metadata about the application that we're most concerned with is the name:

```yaml
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: hello-world
  annotations:
    description: 'HTTP hello world demo'
    # The version field is optional
    version: v0.0.1
spec: ...
```

`wadm` considers the `name` field to be a _globally unique value_.

The `version` field is optional&mdash;if not specified, the version will be assigned a unique alphanumeric value (for example, `01JGMAQX707A6FSGR7DC24RTD3`). 

When application specifications are stored, they are keyed by name and a history of all versions is maintained, with the _most recently pushed_ version being considered the newest. `wadm` does not make assumptions about whether one version string is newer or older than any other (e.g. is `v1.10` is newer than `v1.1`?). Version history is based purely on time of storage.

## Components

While OAM allows us to define any component in a specification, there are only a few components with which `wadm` is concerned:

- `component` - represents a specification of a WebAssembly component
- `capability` - represents a specification of a capability provider

### WebAssembly components

Within the `components` field of a specification, you define a WebAssembly component as follows:

```yaml
spec:
  components:
    - name: http-component
      type: component
      properties:
        # The image field may point to the path of a local .wasm binary
        # or an OCI artifact in an OCI registry
        image: ghcr.io/wasmcloud/components/http-hello-world-rust:0.1.0
        # The id field is optional
        id: hello
        # The config field is optional
        config:
          - name: custom-config
            properties: 
              foo: bar
              log-level: debug
      traits: ...
```

The `image` property of the `component` component contains either a `.wasm` file reference or an OCI image reference URL. You can learn more about wasmCloud and packaging with OCI on the [Packaging](/docs/concepts/packaging.mdx) page.

:::info[Launching WebAssembly components from local files]

To launch a component from a local file, you should prefix the path with `file://`, as follows:

```yaml
spec:
  components:
    - name: http-component
      type: component
      properties:
        image: file://./build/http_hello_world_s.wasm
      traits: ...
```
When launching a WebAssembly component from a local file, ensure that the environment variable `WASMCLOUD_ALLOW_FILE_LOAD=true` is set when you launch wasmCloud. This is the default for hosts running with `wash up`. Only absolute paths are supported, since clients cannot reliably assume which directory the target host was started from. When running hosts locally with `wash up` for development, however, it is possible to use relative paths (which is converted to an absolute path) for convenience.
:::

The `id` property is an optional unique identifier you can assign your component. Generally, we recommend omitting the `id` property&mdash;if no value is provided, `wadm` will assign a generated identifier, which is a combination of the manifest name and the component name. 

Configuration specified in the `config` property will be available to the component at runtime. The `config` property is generally most useful for making arbitrary data available at runtime via the [wasi-runtime-config](https://github.com/WebAssembly/wasi-runtime-config) interface.

⚠️ **NOTE**: Essential configuration options (like specifying ports for an HTTP or Redis server) are typically passed to components and providers through the `source_config` and `target_config` properties of the `link` trait. These properties are covered in the [Traits](#traits) section below, and you can read more about links, sources, and targets on the [Linking at Runtime](/docs/concepts/linking-components/linking-at-runtime.mdx) page.

### Capability providers

To define a **capability provider**, we use a `capability` component, as follows:

```yaml
- name: kvredis
  type: capability
  properties:
    image: ghcr.io/wasmcloud/keyvalue-redis:0.28.2
    # The id field is optional
    id: keyvalue
    # The config field is optional
    config:
      - name: custom-capability-config
        properties: 
          foo: bar
          log-level: debug
```

The `id` property is an optional unique identifier you can assign your capability provider. Generally, we recommend omitting the `id` property&mdash;if no value is provided, `wadm` will assign a generated identifier, which is a combination of the manifest name and the component name. This ID differentiates one capability provider from another on the lattice.

Configuration specified in the `config` property will be available at runtime via the data passed to the provider&mdash;see the [keyvalue-redis](https://github.com/wasmCloud/wasmCloud/blob/main/crates/provider-keyvalue-redis/src/lib.rs#L64) provider for example usage. The `config` property is generally most useful for making arbitrary data available at runtime according to the [wasi-runtime-config](https://github.com/WebAssembly/wasi-runtime-config) interface.

⚠️ **NOTE**: Essential configuration options (like specifying ports for an HTTP or Redis server) are typically passed to components and providers through the `source_config` and `target_config` properties of the `link` trait. These properties are covered in the [Traits](#traits) section below, and you can read more about links, sources, and targets on the [Linking at Runtime](/docs/concepts/linking-components/linking-at-runtime.mdx) page.

## Traits

Traits are metadata associated with a `component`. The following traits are supported:

- `spreadscaler`
- `daemonscaler`
- `link`

### Spreadscaler

The `spreadscaler` trait contains a specification for how you would like to scale a set number of instances of a component. We call it a _spread_ scaler because you declare how you would like the instances of that component spread across the hosts within your lattice by specifying targets with host _labels_. You can think of this like affinity and anti-affinity rules combined with a scale specification.

Take a look at the following sample `spreadscaler` spec:

```yaml
traits:
- type: spreadscaler
  properties:
    instances: 4
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

This definition states that, for this component (a spreadscaler can apply to a `component` or `capability`), you want a total of 4 instances, with 80% of them going to hosts with the `zone` label set to `us-east-1` and 20% of them going to hosts with the `zone` label set to `us-west-1`. Because this system uses labels as selectors, and you can set any arbitrary label on your hosts, you can define practically any conditions for the spread rules.

If you leave the `requirements` section blank then all hosts will be considered possible targets for that component. You can also leave the `spread` definition off so you can simply state that you would like `n` replicas and you don't care where or how you get them:

```yaml
traits:
- type: spreadscaler
  properties:
    instances: 4
```

⚠️ **NOTE**: If you define a label/value pair requirement and `wadm` is unable to find hosts that match this constraint, it will consider this a deployment failure and will _not_ fall back to arbitrary placement.

### Daemonscaler

The `daemonscaler` trait is an alternative to the `spreadscaler` trait. It is a trait that deploys a certain number of instances of a component on every host in your lattice that matches specified labels. Take a look at the following sample `daemonscaler` spec:

```yaml
traits:
- type: daemonscaler
  properties:
    instances: 4
    spread:
    - name: eastcoast
      requirements:
        zone: us-east-1
    - name: westcoast
      requirements:
        zone: us-west-1
```

Note that this looks similar to the above `spreadscaler` spec, but the `daemonscaler` is responsible for running a certain number of instances of a component on _every host_ that matches the label requirements. Instead of running four **total** instances, it will run four instances on **every host** that either has the `zone` label set to `us-east-1` or `us-west-1`. If you leave off the `spread` key entirely, it will run the specified number of instances on _every host_ in your lattice.

:::info[For the Kubernetes developer]
The `daemonscaler` works just like a Kubernetes DaemonSet, spreading components across all hosts that match the label requirements.
:::

### Links

The `link` trait links two entities together with a set of configuration values.

```yaml
# Link to KVredis with local connection
- type: link
  properties:
    target: kvredis
    namespace: wasi
    package: keyvalue
    interfaces: [atomics, store]
    target_config:
      - name: redis-url
        properties:
          url: redis://127.0.0.1:6379
```

The value of the `target` field is the `name` of the entity (in this case, the `kvredis` capability provider) to which this component is linking. 

The `namespace`, `package`, and `interfaces` fields are used to identify the [interface(s)](/docs/concepts/interfaces.mdx) over which the component and the linked entity will communicate. In the example above, a WebAssembly component is linking to the `kvredis` capability provider over the `wasi:keyvalue/atomics` and `wasi:keyvalue/store` interfaces.

The `target_config` field provides essential configuration data to pass on to the provider&mdash;in the example above, that means the address and port of a local Redis server. This link uses a **`target_config`** (rather than a `source_config`) because the WebAssembly component _imports_ on the `keyvalue` interface. For more information on how to understand and use sources and targets, see the [Linking at Runtime](/docs/concepts/linking-components/linking-at-runtime.mdx) page.

:::info[Target vs source configuration]
Links include both a `target_config` and a `source_config` field for providing configuration. This can be used to provide configuration values to just the component that needs them. For example, in the above snippet, the _target_ of the link is the Redis provider which needs to know what URL to connect to, and the _source_ of the link is a component that doesn't need that configuration. This is very important for security sensitive configuration that you don't want to expose unnecessarily to additional components.
:::

The values in these fields are a simple key-value map that will be passed as link definition configuration data at deployment time. Note that the values here **must be strings**, so if you're passing a value like "false" or "125" ensure that you wrap it in single or double quotes.

## Putting it all together

So far we've seen bits and pieces of the application specification YAML. Here's the complete manifest for the [Customize and Extend](/docs/tour/customize-and-extend/) step of the [Quickstart](/docs/tour/hello-world.mdx) example:

```yaml
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: hello-world
  annotations:
    description: 'HTTP hello world demo'
spec:
  components:
    # The component with our business logic
    - name: http-component
      type: component
      properties:
        # This field can also point to artifacts in OCI registries
        image: file://./build/http_hello_world_s.wasm
      traits:
        - type: spreadscaler
          properties:
            instances: 1
        # Link definition for http-component -> kvredis
        - type: link
          properties:
            target: kvredis
            namespace: wasi
            package: keyvalue
            interfaces: [atomics, store]
            target_config:
              - name: redis-url
                properties:
                  url: redis://127.0.0.1:6379
    # The kvredis provider
    - name: kvredis
      type: capability
      properties:
        image: ghcr.io/wasmcloud/keyvalue-redis:0.28.2
    # The httpserver provider
    - name: httpserver
      type: capability
      properties:
        image: ghcr.io/wasmcloud/http-server:0.26.0
      traits:
        # Link definition for httpserver -> http-component
        - type: link
          properties:
            target: http-component
            namespace: wasi
            package: http
            interfaces: [incoming-handler]
            source_config:
              - name: default-http
                properties:
                  address: 0.0.0.0:8000
```

## Further reading

* You can find a step-by-step explanation of the source and target linking in the Quickstart manifest on the [Linking at Runtime](/docs/concepts/linking-components/linking-at-runtime#providers) page. 
* For examples of other application manifests, see the `wadm.yaml` files for the projects in the [**examples** directory of the wasmCloud repository](https://github.com/wasmCloud/wasmCloud/tree/main/examples).