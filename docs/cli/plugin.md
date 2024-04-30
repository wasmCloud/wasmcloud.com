---
title: "wash plugin"
draft: false
sidebar_position: 28
description: "wash plugin command reference"
---

Wash plugin helps you update, install, and retrieve information about wash plugins. Following are the subcommands available under `wash plugin`:

- `install`
- `uninstall`
- `list`

### `install`

This subcommand will install a plugin for wash. These plugins can be used to add additional subcommands to wash. These plugins are Wasm Components and are sandboxed, but care should be taken to ensure that the plugin's code is trusted as it will be granted access to some resources via wash. Plugins can be installed from local files, from a URL, or from an OCI registry.

#### Usage
```
wash install <file|http|https|oci>://<plugin-name>
```

### `uninstall`

This subcommand uninstalls a plugin.

#### Usage

```
wash plugin uninstall <plugin-id>
```

### `list`

This subcommand lists all the installed plugins with some additional metadata

#### Usage

```
wash plugin list
```
