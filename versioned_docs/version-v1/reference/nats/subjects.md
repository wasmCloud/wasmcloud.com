---
title: 'NATS Subjects'
description: 'Reference for NATS subjects used by wasmCloud'
sidebar_position: 1
---

This page provides a complete reference for NATS subjects used by wasmCloud.

## wRPC

NATS Subjects used for wRPC communication adopt the following subject pattern:

```plaintext
{lattice}.{component_id}.wrpc.{protocol_version}.{namespace}:{package}/{interface}@{version}.{function}
```

[See RPC page for more details](/docs/v1/hosts/lattice-protocols/rpc).

## Control Interface

The complete Control Interface documentation can be [found here](/docs/v1/hosts/lattice-protocols/control-interface), and follows the following pattern:

```plaintext
wasmbus.ctl.{version}.{lattice}.{noun}.{verb}.{optional_name}
```

| Subject      | Group      | Details |
|--------------|----------------|--- |
| wasmbus.ctl.v1.{lattice}.provider.auction | Auctions |[Provider](/docs/v1/hosts/lattice-protocols/control-interface#provider)    |
| wasmbus.ctl.v1.{lattice}.component.auction| Auctions |[Component](/docs/v1/hosts/lattice-protocols/control-interface#component) |
| wasmbus.ctl.v1.{lattice}.component.scale.{host-id} | Commands | [Scale component](/docs/v1/hosts/lattice-protocols/control-interface#scale-component)|
| wasmbus.ctl.v1.{lattice}.component.update.{host-id}| Commands | [Update component](/docs/v1/hosts/lattice-protocols/control-interface#update-component)|
| wasmbus.ctl.v1.{lattice}.provider.start.{host-id}| Commands | [Start provider](/docs/v1/hosts/lattice-protocols/control-interface#start-provider)|
| wasmbus.ctl.v1.{lattice}.provider.stop.{host-id}| Commands | [Stop provider](/docs/v1/hosts/lattice-protocols/control-interface#stop-provider) | 
| wasmbus.ctl.v1.{lattice}.host.stop.{host-id}| Commands | [Stop host](/docs/v1/hosts/lattice-protocols/control-interface#stop-host)|
| wasmbus.ctl.v1.{lattice}.config.put.{config-name}| Config | [Put config](/docs/v1/hosts/lattice-protocols/control-interface#put-config) |
| wasmbus.ctl.v1.{lattice}.config.del.{config-name}| Config | [Delete config](/docs/v1/hosts/lattice-protocols/control-interface#delete-config) |
| wasmbus.ctl.v1.{lattice}.config.get.{config-name}| Config | [Get config](/docs/v1/hosts/lattice-protocols/control-interface#get-config) |
| wasmbus.ctl.v1.{lattice}.label.put.{host-id}| Labels | [Put label](/docs/v1/hosts/lattice-protocols/control-interface#put-label) |
| wasmbus.ctl.v1.{lattice}.label.del.{host-id}| Labels | [Delete label](/docs/v1/hosts/lattice-protocols/control-interface#delete-label) |
| wasmbus.ctl.v1.{lattice}.link.get| Queries | [Links](/docs/v1/hosts/lattice-protocols/control-interface#links) |
| wasmbus.ctl.v1.{lattice}.claims.get| Queries | [Claims](/docs/v1/hosts/lattice-protocols/control-interface#claims) |
| wasmbus.ctl.v1.{lattice}.host.get.{host-id}| Queries | [Host inventory](/docs/v1/hosts/lattice-protocols/control-interface#host-inventory) |
| wasmbus.ctl.v1.{lattice}.host.ping| Queries | [Ping hosts](/docs/v1/hosts/lattice-protocols/control-interface#ping-hosts) |
| wasmbus.ctl.v1.{lattice}.link.put| Link operations | [Put link](/docs/v1/hosts/lattice-protocols/control-interface#put-link) |
| wasmbus.ctl.v1.{lattice}.link.del| Link operations | [Delete link](/docs/v1/hosts/lattice-protocols/control-interface#delete-link) |

## wadm API

The wadm API uses the "model" term for brevity; each model is an individual application manifest. The complete wadm API documentation can be [found here](/docs/v1/ecosystem/wadm/api) takes requests in the following format:

```plaintext
wadm.api.{lattice}.{category}.{operation}.{object}
```

| Subject      | Group      | Details |
|--------------|----------------|--- |
| wadm.api.{lattice}.model.put | Models | [Store model](/docs/v1/ecosystem/wadm/api#store-models) |
| wadm.api.{lattice}.model.list | Models | [List models](/docs/v1/ecosystem/wadm/api#get-model-list) |
| wadm.api.{lattice}.model.get.{name} | Models | [Get model](/docs/v1/ecosystem/wadm/api#get-a-model-spec) |
| wadm.api.{lattice}.model.versions.{name} | Models | [Version history](/docs/v1/ecosystem/wadm/api#version-history) |
| wadm.api.{lattice}.model.del.{name} | Models | [Delete model](/docs/v1/ecosystem/wadm/api#delete-models) |
| wadm.api.{lattice}.model.deploy.{name} | Deployments | [Deploy](/docs/v1/ecosystem/wadm/api#deploy) |
| wadm.api.{lattice}.model.undeploy.{name} | Deployments | [Undeploy](/docs/v1/ecosystem/wadm/api#undeploy) |
| wadm.api.{lattice}.model.status.{name} | Deployments | [Deployment status](/docs/v1/ecosystem/wadm/api#deployment-status) |

