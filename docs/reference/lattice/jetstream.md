---
title: "Configuring JetStream"
date: 2018-12-29T11:02:05+06:00
weight: 10
draft: false
---

The wasmCloud lattice makes use of a _distributed cache_. This cache is supplied by [JetStream](https://docs.nats.io/nats-concepts/jetstream), which is convenient because JetStream comes "for free" with any recent NATS server version. For more information on the architectural considerations we made when deciding on JetStream for our distributed cache provider, please consult our [ADR](https://wasmcloud.github.io/adr/0009-jetstream.html).

The wasmCloud lattice uses a JetStream [stream](https://docs.nats.io/jetstream/concepts/streams) to emit _events_ that indicate changes to shared state. The following types of information are maintained within the distributed cache:

- Claims - JWTs are stored for both providers and actors
- Link Definitions
- OCI References - a mapping between OCI URLs and public keys

#### ⚠️ Warning

It is _highly_ recommend that developers _never_ interact with the stream contents/topics directly, and instead use the various operations available on the lattice control interface in order to ensure reliability and stability of the stream contents. In other words, do not directly publish messages _or_ subscribe to `lc.{prefix}.>`.

### Default behavior

If you start a wasmCloud host runtime against a newly started or unconfigured NATS host (with JetStream enabled), then the host will create a new stream for the lattice. The streams are named according to the lattice prefix in order to allow multi-tenancy on a single NATS topic space.

The following stream is created by default by the host:

- Name: `LATTICECACHE_{prefix}` where `prefix` is the lattice prefix
- Subjects: `lc.{prefix}.>`
- Retention: `limits`
- Max Consumers: `-1` (infinite)
- **Max Messages Per Subject**: **`1`** - This is a crucial setting that allows the last event for each keyed item in the stream to be overwritten by a new event. Because we correlate individual subjects with unique keys, this lets us easily convert events into cache storage.
- Storage: `memory`
- Replicas: `1` - this means that only one replica of the stream (cache data) will be maintained regardless of the size of the JetStream cluster
- Duplicate Window: `120000000000`

### Configuring a custom stream

If the wasmCloud host detects a previously existing stream called `LATTICECACHE_{prefix}` with the subjects `lc.prefix.>`, then it _will not_ create a new one or attempt to overwrite settings. This means that, in your environment, you can do things like define a stream that persists to disk and has 5 replicas in a large JetStream cluster and the wasmCloud host will simply utilize that stream without need for code changes or redeployment. In your custom stream, you must also take care to set **max messages per subject** to **`1`** or wasmCloud may not function properly.

Consult the NATS JetStream documentation for information on how to create and customize streams.
