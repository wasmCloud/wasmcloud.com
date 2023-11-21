---
title: "Configuring JetStream"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 10
draft: false
---

The wasmCloud lattice makes use of a _distributed cache_ for lattice-wide metadata. The information in this cache is required to allow a lattice to function properly. It contains the following information:

- Claims - JWTs are stored for both providers and actors
- Link Definitions
- OCI References - a mapping between OCI URLs and public keys

The persistence and implementation of this cache is actually a [NATS Key-Value Bucket](https://docs.nats.io/using-nats/developer/develop_jetstream/kv). When any wasmCloud host starts up, it will create this bucket with the default configuration if it does not yet exist. The default configuration for this key-value bucket is as follows (which you can obtain via the `nats` CLI):

```
$ nats kv info LATTICEDATA_default
Information for Key-Value Store Bucket LATTICEDATA_default created 2023-06-13T08:03:15-04:00

Configuration:

          Bucket Name: LATTICEDATA_default
         History Kept: 1
        Values Stored: 0
   Backing Store Kind: JetStream
          Bucket Size: 0 B
  Maximum Bucket Size: unlimited
   Maximum Value Size: unlimited
     JetStream Stream: KV_LATTICEDATA_default
              Storage: File
```

The bucket name will _always_ be `LATTICEDATA_{lattice-id}`, where `lattice-id` is the unique identifier for the lattice. Unless you've explicitly chosen to use something else, your lattice ID will be `default`. 

If you want to change the number of replicas, the maximum size of the bucket, or any other configuration, you can do so by creating a new KV bucket via the `nats` CLI **_before_** the first wasmCloud host starts. When the host starts, if it detects a pre-existing KV bucket, it will simply reuse that one.


:::warning
It is _strongly_ recommended that developers _never_ interact with the KV bucket contents directly, and instead use the various operations available on the lattice control interface via the `wash` CLI in order to ensure reliability and stability of the stream contents. Manually editing these values could result in corrupted data and unpredictable consequences to the lattice as a whole.
:::

To interrogate the contents of the KV bucket and ensure you're seeing the correct interpretation of the data, you should use the `wash` CLI tool to interact with the control interface. For example, to get the list of all link definitions in the lattice, you would use `wash link query`.
