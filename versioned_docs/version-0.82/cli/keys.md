---
title: "wash keys"
draft: false
sidebar_position: 13
description: "wash keys command reference"
--- 

This command helps a user to generate NATS keys and manage them. Following are the subcommands available under `wash keys`.

- `gen`
- `get`
- `list`


### `gen`
`gen`, short for generate. will generate a secret and public key pair. The type of key pair needs to be specified. The following ke types can be used:

- account
- user
- module (Actor)
- service (Capability Provider)
- server
- operator
- cluster

#### Usage
```
wash keys gen user
wash keys gen server
```

### `get`
This subcommand retrieves a key pair and prints its contents.

#### Usage
```
wash keys get example_module
```

### `list`
Keys generated are stored in `$HOME/.wash/keys`. This subcommand retrieves all the keys stored in this directory. A different keys directory can be specified using the `--directory` flag.

#### Usage
```
wash keys list
```

#### Options
`--directory` (Alias `-d`) Absolute path to where keypairs are stored. Defaults to `$HOME/.wash/keys` [env: WASH_KEYS]

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]