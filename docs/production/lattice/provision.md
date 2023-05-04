---
title: "Provisioning"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 13
draft: false
---

This section of the documentation provides you with information and walkthroughs for provisioning new lattices and managing existing ones.

### Provisioning a New Lattice

Provisioning a new lattice is a simple process. Because of the effort we've made in keeping complexity low for developers and users, the act of provisioning a lattice is as simple as deciding on your _key management strategy_ and then simply starting up new hosts that automatically become part of your lattice.

#### Generating Keys

Deciding on a key management strategy is essential to maintaining security in live environments. The simplest key strategy is for every host to use the same signing key, which will make the valid list of issuers be just the one public key that corresponds to that seed. Each host is given _one_ seed key and then a list of _one or more_ valid issuers (public keys).

You supply the issuers list via the `WASMCLOUD_CLUSTER_ISSUERS` environment variable as a comma-delimited string of 56-character public keys. You supply the host's _single_ signing key via the `WASMCLOUD_CLUSTER_SEED` environment variable, a 57-character seed string.

A combination public/seed keypair can be generated with the `wash` command line tool using the following command:

```bash
$ wash keys gen cluster
Public Key: CDMTUBVGADIQZFWBUZL7LEF7YHZF6CPSKO3HLOTLBQFY2FHDLZFAMYMD
Seed: SCABNLVRXGEJEG5FBBPMMKMMY37FNKVLDY6YXHVL6WA4IRBEYD6ACIQKV4

Remember that the seed is private, treat it as a secret.
```

All cluster keys start with the letter **C**. Cluster seeds therefore start with **SC**.

#### Picking a Namespace Prefix

The _namespace prefix_ is the _unit of isolation_ for a lattice. If you do nothing and configure nothing, then you will be given a namespace prefix of `default`. This is fine for most environments, even production. The only time you'll need to worry about the namespace prefix is if you intend to run multiple parallel lattices on a single NATS topic space. In such a scenario, you'll need the namespace prefix to prevent cross traffic between lattices.

You can set the lattice prefix with the `WASMCLOUD_LATTICE_PREFIX` environment variable.

#### Starting Hosts

If you were to simply start a new wasmCloud host runtime with no additional parameters or configuration, it would create a new "lattice of one" -- the host starts with an _ad hoc_ generated seed key and uses the corresponding public key for the issuers list. This means that you'll need to copy and paste the seed and issuer key that are emitted in the logs and use them in all subsequent hosts.

To ensure that any set of hosts are able to join the same lattice and securely communicate with each other:

- All hosts must start with the same `WASMCLOUD_LATTICE_PREFIX` value
- All hosts must have the same comma-delimited list of `WASMCLOUD_CLUSTER_ISSUERS`
- Each host must have a single `WASMCLOUD_CLUSTER_SEED` that has a corresponding public key in the list of valid cluster issuers
- Each host must have NATS credentials that allow access to a shared NATS topic space for **RPC** - supplied by `WASMCLOUD_RPC_*` environment variables.
- Each host must have NATS credentials that allow access to a shared NATS topic space for **Control** - supplied by the `WASMCLOUD_CTL_*` environment variables.
- Each host must have NATS credentials that can be given to capability providers to grant them access to a shared NATS topic space for **RPC** - supplied by the `WASMCLOUD_PROV_RPC_*` environment variables.

At first glance, you might wonder why the providers are given different RPC credentials than the regular host itself. By default, these are the same credentials. However, developers and operations folks have the option of using different NATS users. The NATS user that has access to the RPC channels can have potentially different limitations than the host that has access to RPC communications. Further, by giving the capability provider a different user than the host, it's possible to enable situations where the user for a provider can be invalidated/disabled at runtime without harming the host.

### Lattice Management

For the most part, lattices are self-maintaining. They sit atop the power and flexibility of NATS and use the shared topic space for discovering and communicating with other hosts within the lattice. All you need to do in order to maintain a lattice is ensure that the NATS servers stay up (and, based on NATS historical reliability, this is an easy task).

One thing that you might want to do when testing or experimenting is _clear the distributed cache_. wasmCloud hosts use a **JetStream** stream named `LATTICECACHE_{prefix}` to publish changes to the distributed cache of actor claims, OCI reference maps, and link definitions. To purge this cache, you'll want to _stop all wasmCloud hosts in the cluster_, and then use the `nats stream purge` command (`nats` is a CLI provided by NATS that you can [install](https://github.com/nats-io/natscli)).

For more information about this cache, please read the [JetStream](./jetstream) topic.
