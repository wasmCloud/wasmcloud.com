---
title: 'NATS Streams and Buckets'
description: 'JetStream resource requirements for wasmCloud deployments'
sidebar_position: 2
---

The first time `wasmCloud` and `wadm` start they will attempt to get or create the following KV buckets and streams. It's recommended to pre-create the buckets and streams in production environments to avoid giving these processes permissions to create or overwrite JetStream resources.

## wasmCloud KV Buckets

wasmCloud requires the following KV buckets per lattice:

### `CONFIGDATA_<lattice>`

Example: `CONFIGDATA_default`

**Suggested configuration:**

- N replicas where N is number of NATS server cluster nodes
- File backed and backed up

### `LATTICEDATA_<lattice>`

Example: `LATTICEDATA_default`

**Suggested configuration:**

- N replicas where N is number of NATS server cluster nodes
- File backed and backed up

## wadm KV Buckets

wadm requires the following KV buckets:

### `wadm_manifests`

**Suggested configuration:**

- N replicas where N is number of NATS server cluster nodes
- File backed and backed up

### `wadm_state`

**Suggested configuration:**

- N replicas where N is number of NATS server cluster nodes
- Optional: File backed and backed up. `wadm_state` can be fully recovered in a maximum of 60 seconds upon reconnecting to a cluster.

## wadm Streams

wadm requires the following streams:

### `wadm_commands`

- **Subjects:** `wadm.cmd.*`
- **Retention:** WorkQueue

### `wadm_events`

- **Subjects:** `wadm.evt.*.>`
- **Retention:** Limits

### `wadm_status`

- **Subjects:** `wadm.status.*.*`
- **Retention:** Limits
- **Maximum Per Subject:** 10

### `wasmbus_events`

- **Subjects:** `wasmbus.evt.*.>`
- **Retention:** Limits

### `wadm_notify`

- **Subjects:** `wadm.notify.*`
- **Retention:** Interest

### `wadm_event_consumer`

- **Retention:** WorkQueue
- **Transform stream**

```
Source Information:

                   Stream Name: wasmbus_events
  Subject Filter and Transform: wasmbus.evt.*.> to wadm_event_consumer.evt.{{wildcard(1)}}.>
                           Lag: 0
                     Last Seen: 135ms

                   Stream Name: wadm_events
  Subject Filter and Transform: wadm.evt.*.> to wadm_event_consumer.evt.{{wildcard(1)}}.>
                           Lag: 0
                     Last Seen: 336ms
```

## Production Configuration

For production deployments, create these buckets with appropriate replication:

```bash
# wasmCloud KV Buckets (replace 'default' with your lattice name)
nats --domain wasmcloud kv add --replicas 3 LATTICEDATA_default
nats --domain wasmcloud kv add --replicas 3 CONFIGDATA_default

# wadm KV Buckets
nats --domain wasmcloud kv add --replicas 3 wadm_manifests
nats --domain wasmcloud kv add --replicas 3 wadm_state
```

If the buckets already exist, you can increase the number of replicas:

```bash
nats --domain wasmcloud stream edit --replicas 3 KV_LATTICEDATA_default
nats --domain wasmcloud stream edit --replicas 3 KV_CONFIGDATA_default
nats --domain wasmcloud stream edit --replicas 3 KV_wadm_manifests
nats --domain wasmcloud stream edit --replicas 3 KV_wadm_state
```
