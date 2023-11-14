---
title: "wash reg"
draft: false
sidebar_position: 18
description: "wash reg command reference"
--- 

`wash reg` allows users to interact with OCI compliant registries and their artifacts. A user may pull artifacts from the registry to use in their projects. They may also push their own projects to registries to use in various lattices. Following are the subcommands available under `wash reg`.

- `push`
- `pull`
- `ping` 

### `push`
Push an artifact to an OCI compliant registry. A user needs to provide a registry URL and the path to the artifact that needs to be pushed.

:::caution
This subcommand will be deprecated in future versions. Please use `wash push` instead.
:::

#### Usage
```
wash reg push wasmcloud.azurecr.io/example:0.0.1 /path/to/artifact
```

#### Options

`--config` (Alias `-c`) Path to config file, if omitted will default to a blank configuration

`--output` (Alias `-o`) Specify output format (`text` or `json`) [default: `text`]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--allow-latest` Allow latest artifact tags

`--annotation` (Alias `-a`) Optional set of annotations to apply to the OCI artifact manifest

`--user` (Alias `-u`) OCI username, if omitted anonymous authentication will be used [env: `USER`]

`--password` (Alias `-p`) OCI password, if omitted anonymous authentication will be used [env: `PASSWORD`]

`--insecure` Allow insecure (HTTP) registry connections

### `pull`
Pull an artifact from an OCI compliant registry

:::caution
This subcommand will be deprecated in future versions. Please use `wash pull` instead.
:::

#### Usage
```
wash reg pull wasmcloud.azurecr.io/echo:0.3.7
```

#### Options

`--destination` File destination of artifact

`--output` Specify output format (`text` or `json`) [default: `text`]

`--digest` (Alias `-d`) Digest to verify artifact against

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--allow-latest` Allow latest artifact tags

`--user` (Alias `-u`) OCI username, if omitted anonymous authentication will be used

`--password` OCI password, if omitted anonymous authentication will be used

`--insecure` Allow insecure (HTTP) registry connections

### `ping`
Ping (test url) to see if the OCI url has an artifact

#### Usage
```
wash reg ping wasmcloud.azurecr.io/echo:0.3.7
```

#### Options

`--output` Specify output format (`text` or `json`) [default: `text`]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--user` (Alias `-u`) OCI username, if omitted anonymous authentication will be used

`--password` OCI password, if omitted anonymous authentication will be used

`--insecure` Allow insecure (HTTP) registry connections