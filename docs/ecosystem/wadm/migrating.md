---
title: 'Migrating from 0.82'
date: 2020-01-19T00:00:00+00:00
icon: 'ti-map' # themify icon pack : https://themify.me/themify-icons
description: 'A quick overview on migrating manifests to 1.0'
type: 'docs'
sidebar_position: 5
---

The manifest format changed between wasmCloud `0.82.0` and wasmCloud `1.0.0`, and this page aims to guide you through converting your manifest to the latest compatible format. This page assumes that any [components](/docs/concepts/components.mdx) you specify in your manifest are built using WIT interfaces.

## Component changes

The `type` field renamed the type from `actor` to `component`, and this is a backwards compatible change. Otherwise, there are only additional fields available like `id` and `config`.

```yaml
components:
  - name: echo
    type: actor // [!code --]
    type: component // [!code ++]
    properties:
      image: wasmcloud.azurecr.io/echo:0.3.8
      id: echo // [!code ++]
      config: // [!code ++]
        - name: default-language // [!code ++]
          properties: // [!code ++]
            lang: en-US // [!code ++]
```

## Provider changes

Capability providers no longer need to specify a `contract` or `link_name` in order to run in a wadm manifest, and these fields can be removed entirely.

```yaml
spec:
  components:
    - name: httpserver
      type: capability
      properties:
        image: wasmcloud.azurecr.io/httpserver:0.19.1
        contract: wasmcloud:httpserver // [!code --]
        link_name: default // [!code --]
      traits:
```

## Link changes

The primary changes to manifests are in links, as links are now **unidirectional** between a source and target and based entirely on a WIT interface rather than a wasmCloud contract. You will need to examine the way your component uses [interfaces](/docs/concepts/interfaces.mdx) in order to migrate to 1.0.

Using the example of the [http-keyvalue-counter](https://github.com/wasmCloud/wasmCloud/tree/main/examples/rust/components/http-keyvalue-counter), let's work through the updates. By inspecting the component, you can determine the direction of each link that the component needs at runtime:

```wit
package root:component;

world root {
  import wasi:keyvalue/store@0.2.0-draft;
  import wasi:keyvalue/atomics@0.2.0-draft;
  <!-- omitted wasi:io/cli/clocks/filesystem -->

  export wasi:http/incoming-handler@0.2.0;
}
```

Each `import` in a component's WIT will be a `link` trait associated with that component, and each `export` will be a link trait associated with a capability provider that targets that component. Once you've rearranged where the `link` trait is organized in the manifest, you can change the format. Note that the `namespace`, `package`, and `interfaces` fields directly correspond to the WIT `import` above:

```yaml
traits:
- type: linkdef // [!code --]
- type: link // [!code ++]
  properties:
    target: redis
    values: // [!code --]
        URL: redis://127.0.0.1:6379/ // [!code --]
    namespace: wasi // [!code ++]
    package: keyvalue // [!code ++]
    interfaces: [atomics, store] // [!code ++]
    target_config: // [!code ++]
        - name: default-url // [!code ++]
          properties: // [!code ++]
            URL: redis://127.0.0.1:6379 // [!code ++]
```

## All together

Taking each step above together, these are the changes to transform the keyvalue-counter example to match the 1.0 format.

```yaml
apiVersion: core.oam.dev/v1beta1
kind: Application
metadata:
  name: kvcounter
  annotations:
    version: v0.0.1
    description: 'wasmCloud Key Value Counter Example'
spec:
  components:
    - name: kvcounter
      type: actor // [!code --]
      type: component // [!code ++]
      properties:
        image: wasmcloud.azurecr.io/kvcounter:0.4.2
      traits:
        - type: spreadscaler
          properties:
            replicas: 1
        - type: linkdef // [!code --]
        - type: link // [!code ++]
            target: redis
            namespace: wasi // [!code ++]
            package: keyvalue // [!code ++]
            interfaces: [atomics, store] // [!code ++]
            target_config: // [!code ++]
              - name: redis-url // [!code ++]
                properties: // [!code ++]
                  url: redis://127.0.0.1:6379 // [!code ++]
            values: // [!code --]
              URL: redis://127.0.0.1:6379/ // [!code --]
        - type: linkdef // [!code --]
          properties: // [!code --]
            target: httpserver // [!code --]
            values: // [!code --]
              ADDRESS: 0.0.0.0:8081 // [!code --]

    - name: httpserver
      type: capability
      properties:
        image: wasmcloud.azurecr.io/httpserver:0.17.0
        contract: wasmcloud:httpserver // [!code --]
      traits: // [!code ++]
        - type: link // [!code ++]
          properties: // [!code ++]
            target: kvcounter // [!code ++]
            namespace: wasi // [!code ++]
            package: http // [!code ++]
            interfaces: [incoming-handler] // [!code ++]
            source_config: // [!code ++]
              - name: default-http // [!code ++]
                properties: // [!code ++]
                  ADDRESS: 0.0.0.0:8081 // [!code ++]
    - name: redis
      type: capability
      properties:
        image: wasmcloud.azurecr.io/kvredis:0.21.0
        contract: wasmcloud:keyvalue // [!code --]
```
