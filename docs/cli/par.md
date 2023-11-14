---
title: "wash par"
draft: false
sidebar_position: 17
description: "wash par command reference"
--- 

`wash par` gives a user the capacity to interact with provider archives. A user may create, inspect or modify provider archive files. Following are the subcommands available under `wash par`.

- `create`
- `inspect`
- `insert`

### `create`
This subcommand creates a provider archive using an architecture target, provider and signing keys. A user will have to provide the capability ID, vendor, name of provider, target architecture and path to provider binary for populating the archive.

#### Usage
```
wash par create --capid <CAPID> --vendor <VENDOR> --name <NAME> --arch <ARCH> --binary /path/to/binary
```

#### Options
`--capid` (Alias `-c`) Capability contract ID (e.g. wasmcloud:messaging or wasmcloud:keyvalue)

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--vendor` (Alias `-v`) Vendor string to help identify the publisher of the provider (e.g. Redis, Cassandra, wasmcloud, etc). Not unique

`--revision` (Alias `-r`) Monotonically increasing revision number

`--version` Human friendly version string

`--schema` (Alias `-j`) Optional path to a JSON schema describing the link definition specification for this provider [env: WASH_JSON_SCHEMA]

`--directory` (Alias `-d`) Location of key files for signing. Defaults to $WASH_KEYS ($HOME/.wash/keys) [env: WASH_KEYS]

`--issuer` (Alias `-i`) Path to issuer seed key (account). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_ISSUER_KEY]

`--subject` (Alias `-s`) Path to subject seed key (service). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_SUBJECT_KEY]

`--name` (Alias `-n`) Name of the capability provider

`--arch` Architecture of provider binary in format ARCH-OS (e.g. x86_64-linux)

`--binary` (Alias `-b`) Path to provider binary for populating the archive

`--destination` File output destination path

`--compress` Include a compressed provider archive

`--disable-keygen` Disables autogeneration of signing keys

### `inspect`
Inspect accepts the path or OCI reference of the provider archive and prints out the properties of the archive.

:::caution
This subcommand will be deprecated in future versions. Please use `wash inspect` instead.
:::

#### Usage
```
wash par inspect wasmcloud.azurecr.io/httpserver:0.17.0

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

`--digest` (Alias `-d`) Digest to verify artifact against (if OCI URL is provided for archive)

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--allow-latest` Allow latest artifact tags (if OCI URL is provided for archive)

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--user` (Alias `-u`) OCI username, if omitted anonymous authentication will be used [env: WASH_REG_USER]

`--password` (Alias `-p`) OCI password, if omitted anonymous authentication will be used [env: WASH_REG_PASSWORD]

`--insecure` Allow insecure (HTTP) registry connections

`--no-cache` skip the local OCI cache

### `insert`
Inserts a provider into a provider archive file

#### Usage
```
wash par insert /path/to/provider-archive --arch <ARCH> --binary /path/to/binary
```

#### Options
`--arch` Architecture of provider binary in format ARCH-OS (e.g. x86_64-linux)

`--binary` (Alias `-b`) Path to provider binary for populating the archive

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--directory` (Alias `-d`) Location of key files for signing. Defaults to $WASH_KEYS ($HOME/.wash/keys) [env: WASH_KEYS]

`--issuer` (Alias `-i`) Path to issuer seed key (account). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_ISSUER_KEY]

`--subject` (Alias `-s`) Path to subject seed key (service). If this flag is not provided, the will be sourced from $WASH_KEYS ($HOME/.wash/keys) or generated for you if it cannot be found [env: WASH_SUBJECT_KEY]

`--disable-keygen` Disables autogeneration of signing keys