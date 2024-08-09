---
title: 'Control Interface'
date: 2018-12-29T11:02:05+06:00
sidebar_position: 3
draft: false
---

The lattice control interface provides a way for clients to interact with the lattice to issue
control commands and queries. This interface is a message broker protocol that supports
functionality for starting and stopping components and providers, declaring links, monitoring
lattice events, holding _auctions_ to determine scheduling compatibility, and more.

The core message broker protocol can be used by any client capable of connecting to NATS. There is
also a [wasmcloud-control-interface](https://docs.rs/wasmcloud-control-interface/) Rust crate that
provides a convenient API for accessing the control interface.

ℹ️ All control interface interactions take place on a _separate_ NATS client connection from the RPC
connection for [security reasons](/docs/deployment/security/nats-segmentation). All requests and replies on the control interface connection are serialized via **JSON**.

## NATS control interface

The following is a list of the operations supported by the control interface.

All of the control interface messages published on NATS subjects use a standard structure. This structure is
`wasmbus.ctl.{version}.{lattice}.{noun}.{verb}.{optional_name}` where `lattice` is a string used to differentiate one lattice
from another (this is also referred to as the "lattice ID"). Note that `lattice` must
correspond to the name of the lattice you intend to control. The control interface is currently
version `v1` and it may be versioned independently of host versions going forward.

⚠️ You must ensure that your lattice is alphanumeric and does not the contain `/` or `.` or
`>` characters, as those have special meaning to the NATS message broker.

### Responses

All control interface responses use the following object structure:

```jsonc
{
  // Boolean indicating success or failure
  "success": true,
  // Optional message with additional context
  "message": "",
  // Optional response object with generic payload, depending on request
  "response": {}
}
```

### Auctions

#### Provider

`nats req wasmbus.ctl.v1.{lattice}.provider.auction <json_body>`

Hold an auction for starting a provider. This allows all hosts that match a given list of requirements
to respond whether or not they can run the provider

##### Request

```json
{
  "constraints": {
    "os": "macos"
  },
  "provider_id": "http-server",
  "provider_ref": "ghcr.io/wasmcloud/http-server:0.22.0"
}
```

##### Response

An auction is a "scatter/gather" type operation. This means that you'll receive multiple json
responses from all hosts until your configured timeout. If using a nats client (like the NATS CLI),
you'll need to set `--replies 0 --timeout <your timeout>`. An example response is below:

```json
{
  "success": true,
  "message": "",
  "response": {
    "host_id": "NAU2KX5RMQAUL35EROZUYD77GVKISUV2GKTUVEZDJMYCGGK2SO7UCO3N",
    "constraints": {
      "os": "macos"
    },
    "provider_id": "http-server",
    "provider_ref": "ghcr.io/wasmcloud/http-server:0.22.0"
  }
}
```

#### Component

`nats req wasmbus.ctl.v1.{lattice}.component.auction <json_body>`

Hold an auction for starting a component. This allows all hosts that match a given list of requirements
to respond whether or not they can run the component

##### Request

```json
{
  "constraints": {
    "os": "macos"
  },
  "component_id": "hello",
  "component_ref": "ghcr.io/wasmcloud/components/http-hello-world-rust:0.1.0"
}
```

##### Response

An auction is a "scatter/gather" type operation. This means that you'll receive multiple json
responses from all hosts until your configured timeout. If using a nats client (like the NATS CLI),
you'll need to set `--replies 0 --timeout <your timeout>`. An example response is below:

```json
{
  "success": true,
  "message": "",
  "response": {
    "host_id": "NAU2KX5RMQAUL35EROZUYD77GVKISUV2GKTUVEZDJMYCGGK2SO7UCO3N",
    "constraints": {
      "os": "macos"
    },
    "component_id": "hello",
    "component_ref": "ghcr.io/wasmcloud/components/http-hello-world-rust:0.1.0"
  }
}
```

### Commands

#### Scale component

`nats req wasmbus.ctl.v1.{lattice}.component.scale.{host-id} <json_body>`

Scales a component on a host to a specific max amount of instances that can run. This means that the
host will automatically scale up to the specified number of instances as requests come in.

This command is idempotent, meaning that if you issue a scale command for a component (with the same
annotations) that is already at the desired scale, the host will respond with an `accepted` value of
`true`.

##### Request

```json
{
  "component_id": "hello",
  "component_ref": "ghcr.io/wasmcloud/components/http-hello-world-rust:0.1.0",
  "host_id": "NAU2KX5RMQAUL35EROZUYD77GVKISUV2GKTUVEZDJMYCGGK2SO7UCO3N",
  "annotations": {
    "key": "value"
  },
  "max_instances": 5,
  "config": ["some-config"]
}
```

The `annotations` field is optional and can be omitted entirely.

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

If the response has a `success` value of `true`, this means the host has accepted the request and
will attempt to scale the component. This _does not_ guarantee the component has scaled. To determine if
the component has started, you should monitor the lattice event stream for the `component_scaled` or `component_scale_failed` event.

#### Update component

`nats req wasmbus.ctl.v1.{lattice}.component.update.{host-id} <json_body>`

Updates a component on a host. This means that the host will attempt to update the component (if it is
running on the host) with the newer version specified.

##### Request

```json
{
  "component_id": "hello",
  "host_id": "NAU2KX5RMQAUL35EROZUYD77GVKISUV2GKTUVEZDJMYCGGK2SO7UCO3N",
  "new_component_ref": "ghcr.io/wasmcloud/components/http-hello-world-rust:0.2.0",
  "annotations": {
    "key": "value"
  }
}
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

If the response has a `success` value of `true`, this means the host has accepted the request and
will attempt to update the component. This _does not_ guarantee the component has updated. To determine if
the component has updated, you should monitor the lattice event stream for the new `component_scaled` event.

#### Start provider

`nats req wasmbus.ctl.v1.{lattice}.provider.start.{host-id} <json_body>`

Starts a capability provider on a host.

##### Request

```json
{
  "provider_ref": "ghcr.io/wasmcloud/http-server:0.22.0",
  "provider_id": "http-server",
  "host_id": "NAU2KX5RMQAUL35EROZUYD77GVKISUV2GKTUVEZDJMYCGGK2SO7UCO3N",
  "annotations": {
    "key": "value"
  },
  "config": ["config-name"]
}
```

The `annotations` field is optional and can be omitted entirely. The `config` field is also optional
and is used to pass configuration to a provider. This is provider-specific and is not used by all
providers or guaranteed to be a specific format.

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

If the response has a `success` value of `true`, this means the host has accepted the request and
will attempt to start the provider. This _does not_ guarantee the provider has started. To determine
if the provider has started, you should monitor the lattice event stream for the `provider_started`
event

#### Stop provider

`nats req wasmbus.ctl.v1.{lattice}.provider.stop.{host-id} <json_body>`

Stops a capability provider on a host.

##### Request

```json
{
  "provider_id": "http-server",
  "host_id": "NAU2KX5RMQAUL35EROZUYD77GVKISUV2GKTUVEZDJMYCGGK2SO7UCO3N"
}
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

#### Stop host

`nats req wasmbus.ctl.v1.{lattice}.host.stop.{host-id} <json_body>`

Stops the host indicated in the request.

##### Request

```json
{
  "host_id": "NAU2KX5RMQAUL35EROZUYD77GVKISUV2GKTUVEZDJMYCGGK2SO7UCO3N",
  "timeout": 10000
}
```

The `timeout` field is optional and can be omitted entirely. If omitted, the host will use a
default timeout value for gracefully shutting down the host.

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

### Config

wasmCloud has support for providing configuration to components and capability providers
using named configuration. Configuration is a map of string values to be as compliant with
the [wasi:runtime/config](https://github.com/WebAssembly/wasi-runtime-config) proposal as possible.

#### Put config

`nats req wasmbus.ctl.v1.{lattice}.config.put.{config-name} <json_body>`

Put a piece of named configuration into the config data bucket.

##### Request

```json
{
  "foo": "bar",
  "key": "value"
}
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

This means the config data has been accepted, but there may be a small delay before it is available
across the whole lattice.

#### Delete config

`nats req wasmbus.ctl.v1.{lattice}.config.del.{config-name} ''`

Deletes a named configuration.

##### Request

```json
[]
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

#### Get config

`nats req wasmbus.ctl.v1.{lattice}.config.get.{config-name} ''`

Retrieves a named configuration.

##### Request

```json
[]
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {
    "foo": "bar",
    "key": "value"
  }
}
```

### Labels

wasmCloud has support for updating labels on a running host.

#### Put label

`nats req wasmbus.ctl.v1.{lattice}.label.put.{host-id} <json_body>`

Put a label on a host. Note that you cannot overwrite the `hostcore.*` labels.

##### Request

```json
{
  "key": "<key>",
  "value": "<value>"
}
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

#### Delete label

`nats req wasmbus.ctl.v1.{lattice}.label.del.{host-id} ''`

Deletes a label from a host. Note that you cannot remove the `hostcore.*` labels from a host.

##### Request

```json
{
  "key": "<key_name>"
}
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

### Queries

#### Links

`nats req wasmbus.ctl.v1.{lattice}.link.get ''`

Queries the lattice for all link definitions.

##### Request

```json
[]
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": [
    {
      "source_id": "ComponentId",
      "target": "LatticeTarget",
      "name": "LinkName",
      "wit_namespace": "WitNamespace",
      "wit_package": "WitPackage",
      "interfaces": ["WitInterface"],
      "source_config": ["KnownConfigName"],
      "target_config": ["KnownConfigName"]
    }
  ]
}
```

#### Claims

`nats req wasmbus.ctl.v1.{lattice}.claims.get ''`

Gets claims from the lattice. Claims contain additional information about entities running in the
lattice for use by the host and other applications.

##### Request

```json
[]
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": [
    {
      "call_alias": "",
      "iss": "ACOJJN6WUP4ODD75XEBKKTCCUJJCY5ZKQ56XVKYK4BEJWGVAOOQHZMCW",
      "name": "blobby",
      "rev": "0",
      "sub": "MBY3COMRDLQYTX2AUTNB5D2WYAH5TUKNIMELDSQ5BUFZVV7CBUUIKEDR",
      "tags": "",
      "version": "0.3.0"
    }
  ]
}
```

Please note that the claims data type is not currently concretely defined. It is basically a
`map<string, string>` that comes straight from the signed JWTs used by wasmCloud. So for components,
only some of the fields will be present and providers will also have a different set of fields. We
hope to make this type more concrete in the future.

#### Host Inventory

`nats req wasmbus.ctl.v1.{lattice}.host.get.{host-id} ''`

Gets the inventory of a given host. This includes all components and providers running on a host as well
as some basic metadata about the host.

##### Request

```json
[]
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {
    "components": [
      {
        "annotations": {
          "wasmcloud.dev/appspec": "rust-hello-world-t",
          "wasmcloud.dev/managed-by": "wadm",
          "wasmcloud.dev/scaler": "0bb7c3c6e3548abdd11e22b558753ab8dfe279373d69d7070c37fdf257de5c11",
          "wasmcloud.dev/spread_name": "default"
        },
        "id": "rust_hello_world_t-http_component",
        "image_ref": "/path/to/http.wasm",
        "max_instances": 1,
        "name": "http-hello-world",
        "revision": 0
      }
    ],
    "friendly_name": "summer-timber-8052",
    "host_id": "NBF52O34AFKW7C6KPOUUYYWJXABUMI2VSDC5R7CGDTZOKYB66O77ZH6A",
    "labels": {
      "hostcore.arch": "aarch64",
      "hostcore.os": "macos",
      "hostcore.osfamily": "unix"
    },
    "providers": [
      {
        "annotations": {
          "wasmcloud.dev/appspec": "blobby",
          "wasmcloud.dev/managed-by": "wadm",
          "wasmcloud.dev/scaler": "38098857a2d2d5fe7b53f68ae37f7932534f5905cd0f10bf1618470cf52bb6d0",
          "wasmcloud.dev/spread_name": "default"
        },
        "id": "blobby-http",
        "image_ref": "ghcr.io/wasmcloud/http-server:0.22.0",
        "name": "http-server-provider",
        "revision": 0
      }
    ],
    "uptime_human": "30s",
    "uptime_seconds": 30,
    "version": "1.1.0"
  }
}
```

#### Ping Hosts

`nats req wasmbus.ctl.v1.{lattice}.host.ping ''`

Pings all hosts in the lattice and gathers responses. This is a "scatter/gather" type operation,
meaning that you'll receive multiple json responses from all hosts until your configured timeout. If
using a nats client (like the NATS CLI), you'll need to set `--replies 0 --timeout <your timeout>`.

##### Request

```json
[]
```

##### Response

```json
{
  "success": true,
  "message": "",
  "hosts": [
    {
      "ctl_host": "nats://127.0.0.1:4222",
      "friendly_name": "summer-timber-8052",
      "id": "NBF52O34AFKW7C6KPOUUYYWJXABUMI2VSDC5R7CGDTZOKYB66O77ZH6A",
      "labels": {
        "hostcore.arch": "aarch64",
        "hostcore.os": "macos",
        "hostcore.osfamily": "unix"
      },
      "lattice": "default",
      "rpc_host": "nats://127.0.0.1:4222",
      "uptime_human": "2m 21s",
      "uptime_seconds": 141,
      "version": "1.1.0"
    }
  ]
}
```

### Link operations

#### Put link

`nats req wasmbus.ctl.v1.{lattice}.link.put <json_body>`

Puts a link definition into the lattice. This defines a connection between a component and a provider
along with a unique set of configuration values.

##### Request

```json
{
  "source_id": "ComponentId",
  "target": "LatticeTarget",
  "name": "LinkName",
  "wit_namespace": "WitNamespace",
  "wit_package": "WitPackage",
  "interfaces": ["WitInterface"],
  "source_config": ["KnownConfigName"],
  "target_config": ["KnownConfigName"]
}
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

#### Delete link

`nats req wasmbus.ctl.v1.{lattice}.link.del <json_body>`

Deletes a link from the lattice.

##### Request

```json
{
  "source_id": "ComponentId",
  "name": "LinkName",
  "wit_namespace": "WitNamespace",
  "wit_package": "WitPackage"
}
```

##### Response

```json
{
  "success": true,
  "message": "",
  "response": {}
}
```

## Lattice events

Lattice events are published on `wasmbus.evt.{lattice}.>` subjects, where `lattice` is
the lattice name (also referred to as the "lattice ID"). Lattice events are
JSON-serialized [CloudEvents](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md) for
easy, standardized consumption. This means that the `data` field in the cloud event envelope is just
another JSON object and does not need to be decoded further. For documentation on all emitted
events, check out the [reference guide](/docs/reference/cloud-event-list.mdx)
