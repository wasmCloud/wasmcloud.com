---
title: "wash push"
draft: false
sidebar_position: 20
description: "wash push command reference"
--- 

Push an artifact to an OCI compliant registry. A user needs to provide a registry URL and the path to the artifact that needs to be pushed.

#### Usage

```
wash push wasmcloud.azurecr.io/example:0.0.1 /path/to/artifact
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
