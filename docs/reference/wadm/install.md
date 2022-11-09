---
title: "Installation"
date: 2022-09-0811:02:05+06:00
weight: 1
draft: false
---

The **w**asmCloud **A**pplication **D**eployment **M**anager (`wadm`) is an Elixir OTP application that you install and run within your infrastructure. For detailed installation and configuration instructions, refer to the documentation in [wadm](https://github.com/wasmCloud/wadm/tree/main/wadm)'s GitHub repository.

## Setup

`wadm` is designed to monitor _multiple_ lattices at any given time. Within each lattice, it can manage multiple application deployments. If all of these lattices are running within the same NATS account or accessible via local anonymous authentication (e.g. _leaf node_), then there's little to no configuration or setup required.

### Integrating with Vault

`wadm` is an inherently multitenant application. It is designed to manage lattices that operate within different NATS accounts. To do this, wadm needs a way to obtain user credentials for any given lattice. Right now, the only supported way of obtaining per-lattice user credentials is through integration with [vault](https://www.vaultproject.io/). The [wadm repo](https://github.com/wasmCloud/wadm/tree/main/wadm#integrating-with-vault) contains the most up to date information on vault integration.

You'll need to install and configure a vault installation capable of supporting wadm and then make sure you set the appropriate values for the following environment variables:

- `WADM_VAULT_TOKEN` - The token used to authenticate against a vault instance. This token needs read access to all of the credentials within the specified vault path.
- `WADM_VAULT_ADDR` - The address of the vault instance (defaults to `http://127.0.0.1:8200`)
- `WADM_VAULT_PATH_TEMPLATE` - Sets a template string that defines the path used for each lattice's credentials.
