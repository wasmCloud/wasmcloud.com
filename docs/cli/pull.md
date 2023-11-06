---
title: "wash pull"
draft: false
sidebar_position: 19
description: "wash pull command reference"
--- 

This command pulls an artifact from an OCI compliant registry.

#### Usage
```
wash pull wasmcloud.azurecr.io/echo:0.3.7
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
