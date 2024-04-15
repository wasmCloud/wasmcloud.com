---
title: "Control Interface"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 3
draft: false
---

The lattice control interface provides a way for clients to interact with the lattice to issue
control commands and queries. This interface is a message broker protocol that supports
functionality for starting and stopping actors and providers, declaring link definitions, monitoring
lattice events, holding _auctions_ to determine scheduling compatibility, and much more.

The core message broker protocol can be used by any client capable of connecting to NATS. There is
also a [wasmcloud-control-interface](https://docs.rs/wasmcloud-control-interface/) Rust crate that
provides a convenient API for accessing the control interface.

ℹ️ All control interface interactions take place on a _separate_ NATS client connection from the RPC
connection for security reasons. All requests and replies on the control interface connection are
serialized via **JSON**.

## NATS control interface

The following is a list of the operations supported by the control interface.

All of the control interface messages published on NATS topics use a standard prefix. This prefix is
`wasmbus.ctl.{lattice}` where `lattice` is a string used to differentiate one lattice
from another (this is also referred to as the "lattice ID"). Note that `lattice` must
correspond to the name of the lattice you intend to control.

⚠️ You must ensure that your namespace prefix is alphanumeric and does not the contain `/` or `.` or
`>` characters, as those have special meaning to the NATS message broker.

### Auctions

#### Provider

`nats req wasmbus.ctl.{lattice}.auction.provider <json_body>`

Hold an auction for starting a provider. This allows all hosts that match a given list of
requirements to respond whether or not they can run the provider

##### Request

```json
{
    "constraints": {
        "os": "macos"
    },
    "link_name": "default",
    "provider_ref": "wasmcloud.azurecr.io/httpserver:0.19.1"
}
```

##### Response

An auction is a "scatter/gather" type operation. This means that you'll receive multiple json
responses from all hosts until your configured timeout. If using a nats client (like the NATS CLI),
you'll need to set `--replies 0 --timeout <your timeout>`. An example response is below:

```json
{
    "host_id": "NOTAREALHOSTID",
    "constraints": {
        "os": "macos"
    },
    "link_name": "default",
    "provider_ref": "wasmcloud.azurecr.io/httpserver:0.19.1" 
}
```

#### Component

`nats req wasmbus.ctl.{lattice}.auction.component <json_body>`

Hold an auction for starting a component. This allows all hosts that match a given list of requirements
to respond whether or not they can run the component

##### Request

```json
{
    "constraints": {
        "os": "macos"
    },
    "actor_ref": "wasmcloud.azurecr.io/echo:0.3.7"
}
```

##### Response

An auction is a "scatter/gather" type operation. This means that you'll receive multiple json
responses from all hosts until your configured timeout. If using a nats client (like the NATS CLI),
you'll need to set `--replies 0 --timeout <your timeout>`. An example response is below:

```json
{
    "host_id": "NOTAREALHOSTID",
    "constraints": {
        "os": "macos"
    },
    "actor_ref": "wasmcloud.azurecr.io/echo:0.3.7"
}
```

### Commands

#### Launch Actor (deprecated)

`nats req wasmbus.ctl.{lattice}.cmd.{host-id}.la <json_body>`

This command is currently deprecated in favor of the scale command as of version 0.79 of the
wasmCloud host. It is documented here purely for completeness

##### Request

```json
{
    "actor_ref": "wasmcloud.azurecr.io/echo:0.3.7",
    "annotations": {
        "key": "value"
    },
    "count": 5,
    "host_id": "NOTAREALHOSTID"
}
```

Note that `annotations` is an optional field. If you do not wish to provide annotations, you may
omit the field entirely.

##### Response

```json
{
    "accepted": true,
    "error": ""
}
```

If the response has an `accepted` value of `true`, this means the host has accepted the request and
will attempt to start the component. This _does not_ guarantee the component has started. To determine if
the component has started, you should monitor the lattice event stream for the `actors_started` event.

#### Stop component

`nats req wasmbus.ctl.{lattice}.cmd.{host-id}.sa <json_body>`

Stops a component on a host, terminating any pre-instantiated instances.

##### Request

```json
{
    "actor_ref": "wasmcloud.azurecr.io/echo:0.3.7",
    "host_id": "NOTAREALHOSTID",
    "annotations": {
        "key": "value"
    }
}
```

The `annotations` field is optional and can be omitted entirely. However, annotations must match the
running annotations of the component in order for the stop command to actually stop the actors. This is
critical for applications such as `wadm` that use annotations to indicate ownership

##### Response

```json
{
    "accepted": true,
    "error": ""
}
```

If the response has an `accepted` value of `true`, this means the host has accepted the request and
will attempt to stop the component. This _does not_ guarantee the component has stopped. To determine if
the component has stopped, you should monitor the lattice event stream for the `actors_stopped` event.

#### Scale component

`nats req wasmbus.ctl.{lattice}.cmd.{host-id}.scale <json_body>`

Scales a component on a host to a specific max amount of instances that can run. This means that the
host will automatically scale up to the specified number of actors as requests come in. Put more
simply, this makes sure a component is "hot" (using that term loosely) and ready to handle requests on
a given host

This command is idempotent, meaning that if you issue a scale command for a component (with the same
annotations) that is already at the desired scale, the host will respond with an `accepted` value of
`true`.

##### Request

```json
{
    "actor_ref": "wasmcloud.azurecr.io/echo:0.3.7",
    "host_id": "NOTAREALHOSTID",
    "annotations": {
        "key": "value"
    },
    "max_concurrent": 5
}
```

The `annotations` field is optional and can be omitted entirely.

##### Response

```json
{
    "accepted": true,
    "error": ""
}
```

If the response has an `accepted` value of `true`, this means the host has accepted the request and
will attempt to start the component. This _does not_ guarantee the component has started. To determine if
the component has started, you should monitor the lattice event stream for the `actors_started` event.

#### Live update component

`nats req wasmbus.ctl.{lattice}.cmd.{host-id}.upd <json_body>`

Live updates a component on a host. This means that the host will attempt to update the component (if it is
running on the host) with the newer version specified.

##### Request

```json
{
    "actor_id": "MNOTAREALACTOR",
    "host_id": "NOTAREALHOSTID",
    "new_actor_ref": "wasmcloud.azurecr.io/echo:0.3.8",
    "annotations": {
        "key": "value"
    }
}
```

The `annotations` field is optional and can be omitted entirely. However, annotations must match the
running annotations of the component in order for the update command to actually update the component.

##### Response

```json
{
    "accepted": true,
    "error": ""
}
```

If the response has an `accepted` value of `true`, this means the host has accepted the request and
will attempt to update the component. This _does not_ guarantee the component has updated. To determine if
the component has updated, you should monitor the lattice event stream for the `actor_updated` event.

#### Launch provider

`nats req wasmbus.ctl.{lattice}.cmd.{host-id}.lp <json_body>`

Launches a capability provider on a host. Unlike actors, only one instance of a provider + link name
can run on any given host.

##### Request

```json
{
    "provider_ref": "wasmcloud.azurecr.io/httpserver:0.19.1",
    "link_name": "default",
    "host_id": "NOTAREALHOSTID",
    "annotations": {
        "key": "value"
    },
    "config": "encoded config string"
}
```

The `annotations` field is optional and can be omitted entirely. The `config` field is also optional
and is used to pass configuration to a provider. This is provider-specific and is not used by all
providers or guaranteed to be a specific format.

##### Response

```json
{
    "accepted": true,
    "error": ""
}
```

If the response has an `accepted` value of `true`, this means the host has accepted the request and
will attempt to start the provider. This _does not_ guarantee the provider has started. To determine
if the provider has started, you should monitor the lattice event stream for the `provider_started`
event

#### Stop provider

`nats req wasmbus.ctl.{lattice}.cmd.{host-id}.sp <json_body>`

Stops a matching capability provider + link name on a host.

##### Request

```json
{
    "provider_ref": "wasmcloud.azurecr.io/httpserver:0.19.1 | VPROVIDERID",
    "link_name": "default",
    "host_id": "NOTAREALHOSTID",
    "contract_id": "wasmcloud:httpserver",
    "annotations": {
        "key": "value"
    }
}
```

##### Response

```json
{
    "accepted": true,
    "error": ""
}
```

If the response has an `accepted` value of `true`, this means the host has accepted the request and
will attempt to stop the provider. This _does not_ guarantee the provider has stopped. To determine
if the provider has stopped, you should monitor the lattice event stream for the `provider_stopped`
event.

#### Stop host

`nats req wasmbus.ctl.{lattice}.cmd.stop <json_body>`

Stops the host indicated in the request.

##### Request

```json
{
    "host_id": "NOTAREALHOSTID",
    "timeout_ms": 10000
}
```

The `timeout_ms` field is optional and can be omitted entirely. If omitted, the host will use a
default timeout value for shutting down the host.

##### Response

```json
{
    "accepted": true,
    "error": ""
}
```

If the response has an `accepted` value of `true`, this means the host has accepted the request and
will attempt to stop the host. This _does not_ guarantee the host has stopped. To determine if and
when the host has stopped, you should monitor the lattice event stream for the `host_stopped` event.

### Config

wasmCloud has support for pull based config for a component. Currently this is something that can be
set using the following set of topics. In the future we may consider adding support for other
sources of config.

In general all config data consists of a string key with arbitrary bytes as a value. It makes no
other guarantees about the kind of data that is stored in the config.

#### Set component config

`nats req wasmbus.ctl.{lattice}.config.put.{actor_id}.{key} <arbitrary_bytes>`

Sets the value of a config key for a component. This will overwrite any value that is currently set

##### Request

Arbitrary bytes. This could be a string or other encoded data.

##### Response

```json
{
  "accepted": true,
  "error": ""
}
```

This means the config data has been accepted, but there may be a small delay before it is available
across the whole lattice

#### Delete specific component config key

`nats req wasmbus.ctl.{lattice}.config.del.{actor_id}.{key} ''`

Deletes a specific config key for a component.

##### Request

Empty body

##### Response

```json
{
  "accepted": true,
  "error": ""
}
```

This means the config data deletion has been accepted, but there may be a small delay before it is
deleted across the whole lattice

#### Delete all component config

`nats req wasmbus.ctl.{lattice}.config.del.{actor_id} ''`

Deletes all config data for a component.

##### Request

Empty body

##### Response

```json
{
  "accepted": true,
  "error": ""
}
```

This means the config data deletion has been accepted, but there may be a small delay before it is
deleted across the whole lattice

### Queries

#### Links

`nats req wasmbus.ctl.{lattice}.get.links ''`

Queries the lattice for all link definitions.

##### Request

Empty body

##### Response

```json
{
    "links": [
        {
            "actor_id": "NOTAREALACTOR",
            "provider_id": "NOTAREALPROVIDER",
            "contract_id": "wasmcloud:httpserver",
            "link_name": "default",
            "values": {
                "PORT": "8080"
            }
        }
    ]
}
```

#### Claims

`nats req wasmbus.ctl.{lattice}.get.claims ''`

Gets claims from the lattice. Claims contain additional information about entities running in the
lattice for use by the host and other applications.

##### Request

Empty body

##### Response

```json
{
  "claims": [
    {
      "call_alias": "",
      "caps": "wasmcloud:httpserver,wasmcloud:blobstore",
      "contract_id": "",
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
`map<string, string>` that comes straight from the signed JWTs used by wasmCloud. So for actors,
only some of the fields will be present and providers will also have a different set of fields. We
hope to make this type more concrete in the future.

#### Host Inventory

`nats req wasmbus.ctl.{lattice}.get.{host-id}.inv ''`

Gets the inventory of a given host. This includes all actors and providers running on a host as well
as some basic metadata about the host.

##### Request

Empty body

##### Response

```json
{
  "actors": [
    {
      "id": "MBY3COMRDLQYTX2AUTNB5D2WYAH5TUKNIMELDSQ5BUFZVV7CBUUIKEDR",
      "image_ref": "wasmcloud.azurecr.io/blobby:0.3.0",
      "instances": [
        {
          "annotations": {},
          "image_ref": "wasmcloud.azurecr.io/blobby:0.3.0",
          "instance_id": "018b451e-a213-febb-c4be-7e6b5080e3b7",
          "revision": 0,
          "max_concurrent": 1
        }
      ],
      "name": "blobby"
    }
  ],
  "host_id": "NCKVAECFVP53CEW7ZF44BZKJHSFL655JRQAUW6JALI5AIPAQTF4PTPKF",
  "issuer": "CDFLNE6XRCTY7LWJT54G6O7K5ZGBDJ3JVGEMGAZOH2TPS4KR4H2JTTAP",
  "friendly_name": "empty-paper-9801",
  "labels": {
    "hostcore.osfamily": "unix",
    "hostcore.os": "macos",
    "hostcore.arch": "aarch64"
  },
  "providers": [
    {
      "annotations": {},
      "id": "VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M",
      "image_ref": "wasmcloud.azurecr.io/httpserver:0.19.1",
      "contract_id": "wasmcloud:httpserver",
      "link_name": "default",
      "name": "HTTP Server",
      "revision": 0
    }
  ]
}
```

Please note that component instances are grouped by annotations. So in the example output above, if
blobby had also been started with the annotations `foo=bar`, then there would be a second instance
group with the annotations `{ "foo": "bar" }`.

#### Ping Hosts

`nats req wasmbus.ctl.{lattice}.ping.hosts ''`

Pings all hosts in the lattice and gathers responses. This is a "scatter/gather" type operation,
meaning that you'll receive multiple json responses from all hosts until your configured timeout. If
using a nats client (like the NATS CLI), you'll need to set `--replies 0 --timeout <your timeout>`.

##### Request

Empty body

##### Response

```json
{
  "cluster_issuers": "CDFLNE6XRCTY7LWJT54G6O7K5ZGBDJ3JVGEMGAZOH2TPS4KR4H2JTTAP",
  "ctl_host": "nats://127.0.0.1:4222",
  "friendly_name": "empty-paper-9801",
  "id": "NCKVAECFVP53CEW7ZF44BZKJHSFL655JRQAUW6JALI5AIPAQTF4PTPKF",
  "issuer": "CDFLNE6XRCTY7LWJT54G6O7K5ZGBDJ3JVGEMGAZOH2TPS4KR4H2JTTAP",
  "js_domain": null,
  "labels": {
    "hostcore.arch": "aarch64",
    "hostcore.os": "macos",
    "hostcore.osfamily": "unix"
  },
  "lattice_prefix": "default",
  "rpc_host": "nats://127.0.0.1:4222",
  "uptime_human": "1h 51m 54s",
  "uptime_seconds": 6714,
  "version": "0.79.0"
}
```

### Get All component Config

`nats req wasmbus.ctl.{lattice}.get.config.{actor_id} ''`

Fetches all config data for a component

##### Request

Empty body

##### Response

```json
{
  "foo": [
    98,
    97,
    114
  ],
  "baz": [
    113,
    117,
    120
  ]
}
```

If no data is set an empty JSON object (`{}`) will be returned

#### Get component config key

`nats req wasmbus.ctl.{lattice}.get.config.{actor_id}.{key} ''`

Fetches a single config key for a component

##### Request

Empty body

##### Response

If the key exists, the following body will be returned:

```json
{
  "data": [
    113,
    117,
    120
  ],
  "found": true
}
```

If the key does not exist, the following body will be returned:

```json
{
  "data": [],
  "found": false
}
```

### Linkdef operations

#### Put link definition

`nats req wasmbus.ctl.{lattice}.linkdefs.put <json_body>`

Puts a link definition into the lattice. This defines a connection between a component and a provider
along with a unique set of configuration values.

##### Request

```json
{
    "actor_id": "NOTAREALACTOR",
    "provider_id": "NOTAREALPROVIDER",
    "contract_id": "wasmcloud:httpserver",
    "link_name": "default",
    "values": {
        "PORT": "8080"
    }
}
```

##### Response

```json
{
    "accepted": true,
    "error": ""
}
```

If the response has an `accepted` value of `true`, this means the host has accepted the request and
will attempt to add the link definition. This _does not_ guarantee the link definition has been
added. To determine if and when the link definition has been added, you should monitor the lattice
event stream for the `linkdef_set` event.

#### Delete link definition

`nats req wasmbus.ctl.{lattice}.linkdefs.del <json_body>`

Deletes a link definition from the lattice.

##### Request

```json
{
    "actor_id": "NOTAREALACTOR",
    "contract_id": "wasmcloud:httpserver",
    "link_name": "default"
}
```

##### Response

```json
{
    "accepted": true,
    "error": ""
}
```

If the response has an `accepted` value of `true`, this means the host has accepted the request and
will attempt to delete the link definition. This _does not_ guarantee the link definition has been
deleted. To determine if and when the link definition has been deleted, you should monitor the
lattice event stream for the `linkdef_deleted` event.

## Lattice events

Lattice events are published on `wasmbus.evt.{lattice}.>` subjects, where `lattice` is
the lattice name (also referred to as the "lattice ID"). Lattice events are
JSON-serialized [CloudEvents](https://github.com/cloudevents/spec/blob/v1.0.1/json-format.md) for
easy, standardized consumption. This means that the `data` field in the cloud event envelope is just
another JSON object and does not need to be decoded further. For documentation on all emitted
events, check out the [reference guide](../../reference/cloud-event-list.md)
