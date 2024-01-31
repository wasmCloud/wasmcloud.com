---
title: "Cloud Event List"
date: 2023-06-13T00:00:00+00:00
description: "List of CloudEvents Used in a Lattice"
sidebar_position: 5
type: "docs"
---
The following is a list of all of the [CloudEvents](https://cloudevents.io) emitted by wasmCloud hosts in a lattice. The events are published to `wasmbus.evt.{lattice-id}.{event-type}`, and so will publish to `wasmbus.evt.default.>` by default.

All of the events in the table below are namespaced by the prefix `com.wasmcloud.lattice`, so the `actor_started` event has the Cloud Event type of `com.wasmcloud.lattice.actor_started`. These event types do _not_ include the lattice identifier.

All fields indicated in the tables below are included in the `data` payload of the Cloud Events 1.0 specification JSON encoding.

Unless otherwise noted, the `source` field of the CloudEvent is the public key of the host from which the event originated.

| Type                    | Fields                                                                                                               | Description                                                                                       |
| :---------------------- | -------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `actor_start_failed`    | `actor_ref`<br/>`error`                                                                                              | Indicates a failed attempt to start an actor                                                      |
| `actor_stopped`         | `public_key`<br/>`instance_id`<br/>`annotations`                                                                     | Indicates a single actor instance stopped on a host                                               |
| `actor_started`         | `public_key`<br />`image_ref`<br/>`api_version`<br/>`instance_id`<br/>`annotations`(map)<br/>`claims`(map)           | A single actor instance started                                                                   |
| `actor_updated`         | `public_key`<br/>`revision`<br/>`instance_id`<br/>                                                                   | An actor "live update" operation completed successfully                                           |
| `actor_update_failed`   | `public_key`<br/>`revision`<br/>`instance_id`<br/>`reason`                                                           | A live update operation failed                                                                    |
| `actors_started`        | `public_key`<br/>`image_ref`<br/>`annotations`<br/>`host_id`<br/>`count`<br/>`claims`(map)                           | A batch of actor instances successfully started. `host_id` is the same as the envelope's `source` |
| `actors_start_failed`   | `public_key`<br/>`image_ref`<br/>`annotations`<br/>`host_id`<br/>`error`                                             | A batch of actor instances failed to start. `host_id` is the same as the envelope's `source`      |
| `actors_stopped`        | `host_id`<br/>`public_key`<br/>`count`<br/>`remaining`<br/>`annotations`                                             | A batch of actor instances stopped. `host_id` is the same as the envelope's `source`              |
| `provider_started`      | `public_key`<br/>`image_ref`<br/>`link_name`<br/>`contract_id`<br/>`instance_id`<br/>`annotations`<br/>`claims`(map) | A capability provider succesfully started                                                         |
| `provider_start_failed` | `provider_ref`<br/>`link_name`<br/>`error`                                                                           | A capability provider failed to start                                                             |
| `provider_stopped`      | `public_key`<br/>`link_name`<br/>`contract_id`<br/>`instance_id`<br/>`annotations`<br/>`reason`                      | A capability provider stopped                                                                     |
| `host_started`          | `labels`<br/>`friendly_name`<br/>`uptime_seconds`<br/>`version`                                                      | Announced by a host after completing initialization                                               |
| `host_stopped`          | `labels`                                                                                                             | Announced by a host just prior to final termination                                               |
| `host_heartbeat`        | `actors`<br/>`providers`<br/>`labels`<br/>`friendly_name`<br/>`version`<br/>`uptime_seconds`<br/>`uptime_human`      | Periodically emitted by hosts to advertise inventory and status                                   |
| `health_check_passed`   | `public_key`<br/>`contract_id`<br/>`link_name`                                                                       | A provider health check passed                                                                    |
| `health_check_failed`   | `public_key`<br/>`contract_id`<br/>`link_name`                                                                       | A provider health check failed                                                                    |
| `health_check_status`   | `public_key`<br/>`contract_id`<br/>`link_name`                                                                       | Provider health status unchanged                                                                  |
| `refmap_set`            | `oci_url`<br/>`public_key`                                                                                           | Event advertising a reference mapping being cached                                                |
| `linkdef_set`           | `id`<br/>`actor_id`<br/>`provider_id`<br/>`link_name`<br/>`contract_id`<br/>`values`(map)                            | Event advertising a link definition being cached                                                  |
| `linkdef_deleted`       | `id`<br/>`actor_id`<br/>`provider_id`<br/>`link_name`<br/>`contract_id`<br/>`values`(map)                            | Event advertising link definition being deleted from cache                                        |

The following events are emitted on a special topic, `wasmbus.rpcevt.{lattice-id}` to keep the relatively chatty RPC notifications separate from the other events.

| Type                  | Fields                                                                                                                                                         | Description                 |
| :-------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------- |
| `invocation_failed`   | **`source`** (`public_key`, `contract_id`, `link_name`)<br/> **`dest`** (`public_key`, `contract_id`, `link_name`) <br/>`operation`<br/> `bytes` (payload len) | An RPC failure notification |
| `invocation_suceeded` | _Same as above_                                                                                                                                                | An RPC success notification |
