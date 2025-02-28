---
title: "wash claims"
draft: false
sidebar_position: 5
description: "wash claims command reference"
---

<head>
  <meta name="robots" content="noindex" />
</head>

Every actor in a wasmCloud environment claims its capabilities or the features it can interact with to supplement its current behavior. These capabilities are claimed in the form of JSON Web Tokens (JWTs). `wash claims` will assist you to generate, manage and view these JWTs for wasmCloud actors. Following are the subcommands available under `wash claims`.

- `inspect`
- `sign`
- `token`

## `inspect`

:::warning
This subcommand will be deprecated in future versions. Please use `wash inspect` instead.
:::

Inspect helps you to examine the capabilities of a wasmCloud component. It accepts the path to the wasmCloud actor or provider and prints out the properties of that component.

#### Usage

```
➜ wash claims inspect wasmcloud.azurecr.io/echo:0.3.7


                               Echo - Module
  Account       ACOJJN6WUP4ODD75XEBKKTCCUJJCY5ZKQ56XVKYK4BEJWGVAOOQHZMCW
  Module        MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5
  Expires                                                          never
  Can Be Used                                                immediately
  Version                                                      0.3.7 (4)
  Call Alias                                                   (Not set)
                               Capabilities
  HTTP Server
  Logging
                                   Tags
  None


➜ wash claims inspect wasmcloud.azurecr.io/httpserver:0.19.1


                            HTTP Server - Provider Archive
  Account                   ACOJJN6WUP4ODD75XEBKKTCCUJJCY5ZKQ56XVKYK4BEJWGVAOOQHZMCW
  Service                   VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M
  Capability Contract ID                                        wasmcloud:httpserver
  Vendor                                                                   wasmCloud
  Version                                                                     0.17.0
  Revision                                                                         0
                            Supported Architecture Targets
  x86_64-macos
  armv7-linux
  aarch64-linux
  x86_64-windows
  x86_64-linux
  aarch64-macos

```

#### Options

`--jwt-only` Extract the raw JWT from the file and print to stdout

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--digest` (Alias `-d`) Digest to verify artifact against (if OCI URL is provided for component)

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--allow-latest` Allow latest artifact tags (if OCI URL is provided for component)

`--user` (Alias `-u`) OCI username, if omitted anonymous authentication will be used [env: WASH_REG_USER]

`--password` (Alias `-p`) OCI password, if omitted anonymous authentication will be used [env: WASH_REG_PASSWORD]

`--insecure` Allow insecure (HTTP) registry connections

`--no-cache` skip the local OCI cache

## `sign`

`wash claims sign` assists you in signing a WebAssembly component by specifying some standard capabilities available in the wasmCloud environment. A user may also specify custom capabilities and other metadata such as expiration, tags, etc.

#### Usage

```
wash claims sign /path/to/wasm-module --name=component-name -q -k
```

#### Options

`--destination` (Alias `-d`) Destination for signed module. If this flag is not provided, the signed module will be placed in the same directory as the source with a "\_s" suffix

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--keyvalue` (Alias `-k`) Enable the Key/Value Store standard capability

`--msg` (Alias `-g`) Enable the Message broker standard capability

`--http_server` (Alias `-q`) Enable the HTTP server standard capability

`--http_client` Enable the HTTP client standard capability

`--blob_store` (Alias `-f`) Enable access to the blob store capability

`--extras` (Alias `-z`) Enable access to the extras functionality (random nos, guids, etc)

`--logging` (Alias `-l`) Enable access to logging capability

`--events` (Alias `-e`) Enable access to an append-only event stream provider

`--name` (Alias `-n`) A human-readable, descriptive name for the token

`--cap` (Alias `-c`) Add custom capabilities

`--tag` (Alias `-t`) A list of arbitrary tags to be embedded in the token

`--prov` (Alias `-p`) Indicates whether the signed module is a capability provider instead of an actor (the default is actor)

`--rev` (Alias `-r`) Revision number

`--ver` (Alias `-v`) Human-readable version string

`--call-alias` (Alias `-a`) Developer or human friendly unique alias used for invoking an actor, consisting of lowercase alphanumeric characters, underscores '\_' and slashes '/'

`--issuer` (Alias `-i`) Path to issuer seed key (account). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_ISSUER_KEY]

`--subject` (Alias `-s`) Path to subject seed key (module). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_SUBJECT_KEY]

`--directory` Location of key files for signing. Defaults to $WASH_KEYS ($HOME/.wash/keys) [env: WASH_KEYS]

`--expires` (Alias `-x`) Indicates the token expires in the given amount of days. If this option is left off, the token will never expire

`--nbf` (Alias `-b`) Not before days. Period in days that must elapse before this token is valid. If this option is left off, the token will be valid immediately

`--disable-keygen` Disables autogeneration of keys if seed(s) are not provided

## `token`

Using this subcommand, a user can generate signed JWTs for actors, operators, accounts and providers by supplying basic token information, a signing seed key and metadata. Following are the subcommands available under token.

- `actor`
- `operator`
- `account`
- `provider`

### `actor`

Generate a signed JWT for an actor

#### Usage

```
wash claims token actor --name=example -k
```

#### Options

`--keyvalue` (Alias `-k`) Enable the Key/Value Store standard capability

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--msg` (Alias `-g`) Enable the Message broker standard capability

`--http_server` (Alias `-q`) Enable the HTTP server standard capability

`--http_client` Enable the HTTP client standard capability

`--blob_store` (Alias `-f`) Enable access to the blob store capability

`--extras` (Alias `-z`) Enable access to the extras functionality (random nos, guids, etc)

`--logging` (Alias `-l`) Enable access to logging capability

`--events` (Alias `-e`) Enable access to an append-only event stream provider

`--name` (Alias `-n`) A human-readable, descriptive name for the token

`--cap` (Alias `-c`) Add custom capabilities

`--tag` (Alias `-t`) A list of arbitrary tags to be embedded in the token

`--prov` (Alias `-p`) Indicates whether the signed module is a capability provider instead of an actor (the default is actor)

`--rev` (Alias `-r`) Revision number

`--ver` (Alias `-v`) Human-readable version string

`--call-alias` (Alias `-a`) Developer or human friendly unique alias used for invoking an actor, consisting of lowercase alphanumeric characters, underscores '\_' and slashes '/'

`--issuer` (Alias `-i`) Path to issuer seed key (account). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_ISSUER_KEY]

`--subject` (Alias `-s`) Path to subject seed key (module). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_SUBJECT_KEY]

`--directory` Location of key files for signing. Defaults to $WASH_KEYS ($HOME/.wash/keys) [env: WASH_KEYS]

`--expires` (Alias `-x`) Indicates the token expires in the given amount of days. If this option is left off, the token will never expire

`--nbf` (Alias `-b`) Not before days. Period in days that must elapse before this token is valid. If this option is left off, the token will be valid immediately

`--disable-keygen` Disables autogeneration of keys if seed(s) are not provided

### `operator`

Generate a signed JWT for an operator

#### Usage

```
wash claims token operator --name=example
```

#### Options

`--name` (Alias `-n`) A human-readable, descriptive name for the token

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--issuer` (Alias `-i`) Path to issuer seed key (account). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_ISSUER_KEY]

`--additional-key` (Alias `-a`) Additional keys to add to valid signers list Can either be seed value or path to seed file

`--directory` Location of key files for signing. Defaults to $WASH_KEYS ($HOME/.wash/keys) [env: WASH_KEYS]

`--expires` (Alias `-x`) Indicates the token expires in the given amount of days. If this option is left off, the token will never expire

`--nbf` (Alias `-b`) Not before days. Period in days that must elapse before this token is valid. If this option is left off, the token will be valid immediately

`--disable-keygen` Disables autogeneration of keys if seed(s) are not provided

### `account`

Generate a signed JWT for an account

#### Usage

```
wash claims token account --name=example
```

#### Options

`--name` (Alias `-n`) A human-readable, descriptive name for the token

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--issuer` (Alias `-i`) Path to issuer seed key (account). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_ISSUER_KEY]

`--subject` (Alias `-s`) Path to subject seed key (module). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_SUBJECT_KEY]

`--additional-key` (Alias `-a`) Additional keys to add to valid signers list Can either be seed value or path to seed file

`--directory` Location of key files for signing. Defaults to $WASH_KEYS ($HOME/.wash/keys) [env: WASH_KEYS]

`--expires` (Alias `-x`) Indicates the token expires in the given amount of days. If this option is left off, the token will never expire

`--nbf` (Alias `-b`) Not before days. Period in days that must elapse before this token is valid. If this option is left off, the token will be valid immediately

`--disable-keygen` Disables autogeneration of keys if seed(s) are not provided

### `provider`

Generate a signed JWT for a capability provider

#### Usage

```
wash claims token provider --name=example --capid=your-capid --vendor=vendor-name
```

#### Options

`--name` (Alias `-n`) A human-readable, descriptive name for the token

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--capid` (Alias `-c`) Capability contract ID that this provider supports

`--vendor` (Alias `-v`) A human-readable string identifying the vendor of this provider (e.g. Redis or Cassandra or NATS etc)

`--revision` (Alias `-r`) Monotonically increasing revision number

`--version` (Alias `-e`) Human-friendly version string

`--issuer` (Alias `-i`) Path to issuer seed key (account). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_ISSUER_KEY]

`--subject` (Alias `-s`) Path to subject seed key (module). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_SUBJECT_KEY]

`--directory` Location of key files for signing. Defaults to $WASH_KEYS ($HOME/.wash/keys) [env: WASH_KEYS]

`--expires` (Alias `-x`) Indicates the token expires in the given amount of days. If this option is left off, the token will never expire

`--nbf` (Alias `-b`) Not before days. Period in days that must elapse before this token is valid. If this option is left off, the token will be valid immediately

`--disable-keygen` Disables autogeneration of keys if seed(s) are not provided
