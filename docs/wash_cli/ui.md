---
title: "wash ui"
draft: false
sidebar_position: 25
description: "wash ui command reference"
--- 

This command starts a wasmCloud web UI called the washboard. This is an experimental feature and needs the `--experimental` flag passed to the command in order to be run. By default the UI runs on port 3030. To run on a different port, pass the port number to the `--port` flag.

### Usage
```
wash ui --experimental
wash ui --experimental --port=8080
```

### Options
`--output` (Alias `-o`) Specify output format (text or json) [default: text]
`--port` (Alias `-p`) Whist port to run the UI on, defaults to 3030 [default: 3030]
`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]