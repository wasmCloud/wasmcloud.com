---
title: "Wash plugins"
date: 2024-04-26T11:02:05+06:00
draft: false
sidebar_position: 3
description: "Using wash plugins"
---

:::tip

Wash plugins are available starting with version 0.28

:::

Wash plugins are a way to extend the functionality of wash. They are Wasm components that can be
used to add new subcommands to wash. This functionality is experimental, but enabled by default.
What this means is that we may change the plugin API based on feedback of those using it. However,
due to the power of the component model, it is very easy to adapt an older version of a plugin to a
newer version of the API, likely with no changes to the plugin's code and transparent to users.

## Managing and consuming plugins

### Installing a plugin

Installation of a plugin is a relatively straightforward process. A plugin can be installed from a
local file, a URL, or from an OCI registry. This is done by specifying it in URI format. Some
examples of this follow:

- `file:///path/to/plugin.wasm`
- `https://github.com/myuser/plugins/releases/download/v0.1.0/wash-plugin.wasm`
- `oci://ghcr.io/myuser/plugins/wash-plugin:v0.1.0`

To install a plugin, run the following command:

```shell
wash plugin install https://github.com/myuser/plugins/releases/download/v0.1.0/wash-plugin.wasm

Plugin Hello (version 0.1.0) installed
```

The command will download the plugin, validate it, and then install it – erroring if there are any
issues with the process

There are also additional options for authenticating with an OCI registry and validating the
checksum of the downloaded plugin. To see these options, run `wash plugin install --help`.

### Updating a plugin

By default, if you try to install a plugin that already exists or is registered with the same name,
wash will refuse to install it. This is to prevent you from accidentally overwriting a plugin that
you may have previously installed. If you want to update an existing plugin, just pass the
`--update` flag to `wash plugin install`. This will overwrite the existing plugin with the new one,
so be careful!

### Listing installed plugins

To list all installed plugins, run `wash plugin list`. This will show you a list of plugins and
their versions, along with other useful metadata.

```shell
wash plugin list

Name           ID      Version   Author      Description
Hello Plugin   hello   0.1.0     WasmCloud   A simple plugin that says hello and logs a bunch of things
```

Please note that the ID is used for calling the plugin from the CLI and for uninstalling it.

### Uninstalling a plugin

To uninstall a plugin, run `wash plugin uninstall <plugin-id>`. This will remove the plugin from the
list of installed plugins.

### Running a plugin

Once a plugin is installed, You can run it by calling `wash <plugin-id>`. This will run the plugin
and pass any arguments to it. To see what flags and arguments are supported, pass the `--help` flag
to the plugin.

```shell
wash hello --help

A simple plugin that says hello and logs a bunch of things

Usage: wash hello [OPTIONS] [name]

Arguments:
  [name]  A random name

Options:
      --foo <foo>        A foo variable
  -o, --output <OUTPUT>  Specify output format (text or json) [default: text]
      --experimental     Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]
  -h, --help             Print help
  -V, --version          Print version
```

#### Configuring a plugin

Each plugin will have its own set of configuration that it will need to document. However, there are
a few key concepts that apply to all plugins. All plugins are only sent environment variables with
the prefix `WASH_PLUGIN_<plugin_id_uppercase>_`. This means that if you have a plugin named `foo`,
it will receive `WASH_PLUGIN_FOO_` as its environment variable prefix. So all environment variables
used to configure that plugin will be prefixed with `WASH_PLUGIN_FOO_`.

All plugins also get access to a directory for storing data. This directory is located at
`$WASH_DIR/plugins/scratch/<plugin_id>`. This directory is used to store any data that the plugin
needs to persist between runs. This means that any plugin with a configuration file will have it
stored somewhere in that directory.

#### Plugin access and security

Plugins are only granted access to specific resources in the Wasm sandbox. The following list
enumerates exactly which resources are granted to each plugin:

- Stdin
- Stdout
- Stderr
- A single directory with full write privileges at `$WASH_DIR/plugins/scratch/<plugin_id>`
- The ability to do outbound HTTP requests to any address
- Environment variable passthrough for all environment variables that start with
  `WASH_PLUGIN_<plugin_id_uppercase>_` (e.g. `WASH_PLUGIN_FOO_` for a plugin with the id of "foo")

We will also be adding the ability in the future for plugins to get access to a control interface
client (the ability to access and interact with a lattice).

To summarize, wash plugins are much more locked down than standard plugin models thanks to Wasm.
However, they still have access to some more privileged resources so they can actually do some
useful things. So, still be careful that your plugin is coming from a trusted source before
installing. As the plugin ecosystem continues to evolve we will add more ways to fine tune what a
plugin is allowed access to at any given time.

### Disabling plugins

Because plugins hook into the command line, they are loaded every time you run `wash` and before any
arguments are parsed. If you wish to turn off plugins, you can set the environment variable
`WASH_PLUGINS_DISABLED` to `true` (or any other value as it only checks if it is set). This will
prevent all plugins from being loaded. Please note that this doesn't disable the `wash plugin`
subcommand, but rather just prevents plugins from being loaded.
