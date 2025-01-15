---
title: "wash Plugin Developer Guide"
date: 2024-04-26T11:02:05+06:00
draft: false
sidebar_position: 4
description: "How to create your own plugins"
---

:::tip

wash plugins are available starting with version 0.28.

:::

This guide assumes some familiarity with building Wasm components. If you're not familiar with Wasm
components and WIT, please read our existing [developer documentation](/docs/developer/components/) first.

## Creating a plugin

The easiest way to get started creating a plugin is to use `wash new component` and select one of
the plugin examples from the list. This will get you started with a fully functional example plugin
that demonstrates how to use all of the available functionality.

### Plugin API

The Plugin API is defined via WIT and is a small wrapper around the standard `wasi:cli/run`
interface. The WIT is defined in the `wash-lib` crate and can be found
[here](https://github.com/wasmCloud/wasmCloud/tree/main/crates/wash-lib/wit). To use this wit, just
add `wasmcloud:wash/subcommand@0.1.0;` to your component's `world.wit` file.

A plugin can be any component that exports `wasi:cli/run` and the wasmCloud-defined interface called
`wasmcloud:wash/subcommand`. This is a very small interface that expects a single function called
`register` that returns metadata about the plugin. The definition for this data can be found in the
WIT, but is defined below for convenience:

```wit
/// Information about an argument
record argument {
    /// The description of the argument. Used for documentation in the CLI
    description: string,
    /// Whether or not the argument is a path. If the argument is a path, wash will load this
    // path (with access to only the file if it is a file path and access to the directory if
    /// it is a directory path) and pass it as a preopened dir at the exact same path
    is-path: bool,
    /// Whether or not the argument is required. 
    required: bool,
}

/// The metadata for a plugin used for registration and setup
record metadata {
    /// The friendly name of the plugin
    name: string,
    /// The ID of the plugin. This must be unique across all plugins and is used as the name of
    /// the subcommand added to wash. This ID should contain no whitespace
    id: string,
    /// The version of the plugin
    version: string,
    /// The author of the plugin
    author: string,
    /// The description of the plugin. This will be used as the top level help text for the plugin
    description: string,
    /// The list of flags and their documentation that can be used with this plugin. The key is
    /// the name of the flag.
    %flags: list<tuple<string, argument>>,
    /// The list of positional arguments that can be used with this plugin. The key is the name
    /// of the argument.
    arguments: list<tuple<string, argument>>,
}
```

Most of these fields are fairly straightforward, but the `%flags` and `arguments` fields are a bit
more complicated. These fields are used to define the flags and positional arguments that can be
used with the plugin. These fields are defined as a list of tuples (as WIT doesn't have support for
a `map` type yet) where the first element of the tuple is the name of the flag or argument and the
second element is additional configuration for an argument. Every argument should have a description
and can also indicate to `wash` whether the argument is required and if it is a path (which matters
for accessing files. See [`run` function section](#run-function-implementation-details) for more
information). For `arguments`, the order matters as they are positional arguments. This data is used
to hook in to the CLI parsing library, meaning that when the plugin is run, the CLI will
automatically parse the flags and arguments to make sure they are valid. There is not currently any
way to inform the CLI parsing library which arguments are required and which are optional, so it
only provides a basic sanity check (such as if an unknown flag is passed) and to hook in help text
to `wash`.

Because a plugin just uses `wasi:cli/run`, any component that already implements that interface can
be used by composing it with another component that exports the `wasmcloud:wash/subcommand`
interface. In the future we plan on adding an example of doing this.

#### Availability of other resources during registration

When `wash` first loads a plugin to call the `register` function, it will be loaded with a "deny
all" policy for all system resources. This means that the plugin can't access any of the resources
that are normally available to a plugin. This is specifically for purposes of security as it ensures
that a plugin is only returning the necessary information for registering the plugin. Once a plugin
is loaded and is called directly, it is given access to system resources as described below.

### `run` function implementation details

When a plugin is run, the `wash` will call the `run` function exported by your plugin. The plugin
will be passed all arguments that were passed after `wash`, including the plugin name. So if you had
a plugin called `foo` and the user ran `wash foo --bar baz`, the `run` function would be called with
the arguments `["foo", "--bar", "baz"]`. The `run` function is responsible for parsing the arguments
in whatever way you see fit. The `run` function doesn't support returning a specific return code,
but `wash` will ensure that the return code is 0 if the `run` function returns normally and a
non-zero return code if the `run` function returns with an error. A plugin is also allowed to use
`wasi:cli/exit` to exit early as well, but this may cause some `wash` cleanup to not run.

A plugin has access to the following resourses while it is running:

- Stdin
- Stdout
- Stderr
- A single directory with full read/write privileges at `$WASH_DIR/plugins/scratch/<plugin_id>`
- Write access to any directories passed as an argument (if the argument is marked as a path)
- Read access to any directory containing a file path passed as an argument as well as full
  read/write access to the files in that directory (if the argument is marked as a path)
- The ability to do outbound HTTP requests to any address
- Environment variable passthrough for all environment variables that start with
  `WASH_PLUGIN_<plugin_id_uppercase>_` (e.g. `WASH_PLUGIN_FOO_` for a plugin with the id of "foo")

Just like a normal CLI, the plugin can read the incoming stdin and should write any
messages/logs/etc to stdout/stderr.

#### Accessing files in the plugin

When defining your arguments returned from the `register` function for the plugin, you are able to 
indicate that any given argument should be treated as a path. If a user passes that argument to the
plugin, it will be configured to allow access for the plugin using a Wasi preopen directory. Please
note that the directory (whether it is the directory containing a file or a directory itself) must 
exist before the plugin can actually load it.

The default plugin scratch directory is "mounted" into the plugin at `/`. Every other directory/file
path goes through a canonicalization step before it is passed to the plugin. This canonicalization
step ensures that the plugin is only given access to the directories/files that it is explicitly
allowed to access. For example, if the following example plugin accepted two arguments, one a
directory, and the other one a path, this is how things would be parsed:

```shell
wash my-plugin ./bar ../other/baz.txt
```

For purposes of this example, we'll assume `./bar` is at a fully qualified path of `/foo/bar` and
`../other/baz.txt` has a fully qualified path of `/my-files/other/baz.txt`. Before running your
plugin, wash will normalize the paths to `/foo/bar` and `/my-files/other/baz.txt` respectively. It
will then replace the path arguments passed to the plugin with the canonicalized paths. So with the
example above, the arguments array given to the plugin would be `["my-plugin", "/foo/bar",
"/my-files/other/baz.txt"]`. 

Each of the paths passed as arguments will be "mounted" at the exact same paths in the plugin. In
the case of a file path, it will mount the file's parent directory. So for the example above, you
will be able to access `/foo/bar` and `/my-files/other/` from within the plugin. The example plugin
template has code that shows how you can access each of the files.

##### Windows Paths

Because Wasm is platform agnostic, some languages (such as Rust) will not be able to parse file
paths properly that do not use the standard unix file separator (i.e. `/`). On Windows systems, in
addition to fully canonicalizing the paths, `wash` will also convert all file paths to use the
standard unix file separator (`/`). For example, if you pass a path like `.\my\files` to the plugin,
it will be normalized, mounted in the plugin, and passed as an argument in the form
`//?//C://fully/qualified/path/to/my/files`. The `?` prefix is an artifact of the canonicalization
and shouldn't effect your loading of the path

### Configuring your plugin

All plugins are expected to document their configuration options (whether it be a file, environment
variables, or command line flags) in a README or other well-known location. As noted in previous
sections, all command line options will be added to the autogenerated help text for `wash`.

Outside of command line flags, there are generally two ways to configure a CLI: environment
variables or configuration files (or both). Every plugin is given a list of environment varibles
that are prefixed with `WASH_PLUGIN_<plugin_id_uppercase>_`. So if you have a plugin with the id of
"foo", any variable with the prefix `WASH_PLUGIN_FOO_` will be available for the plugin to consume.
This means that any configuration via environment variables must be done via this naming scheme.

For configuration files, every plugin is given a directory at
`$WASH_DIR/plugins/scratch/<plugin_id>`. A plugin can use this directory to store any configuration
files it needs (in addition to any specific application data it needs to persist). The configuration
file format and parsing is left to the maintainer of a plugin, but it should also be documented. So
if you had a `config.toml` file for your plugin, you should let users know that if they need to
create or edit that file, it should be at `$WASH_DIR/plugins/scratch/<plugin_id>/config.toml`.

## Future development

Currently we only support subcommand-style plugins for `wash`. In the future, we plan to add support
for auth plugins, registry plugins, and resource plugins (plugins used to access custom enterprise
resources that hook into wasmCloud such as ingress points, queues, DBs, etc.). Each of these will
likely have a separate interface that is part of the `wasmcloud:wash` WIT package.

The `subcommands` world will also have support for the CTL interface added to it in the near future.
This will allow plugins access to interact with wasmCloud lattices.
