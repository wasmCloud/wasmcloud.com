---
title: "wash new"
draft: false
sidebar_position: 16
description: "wash new command reference"
--- 

This command creates a new project from an existing template. A user may create an actor, provider or an interface project. This command takes you through the process in an interactive way. Following are the subcommands available under `wash new`:

- `actor`
- `provider`
- `interface`

### `actor`
When creating a new actor project, a user may select from the following templates to create a skeleton:

- hello-world-rust: A hello-world actor in Rust thay responds over an HTTP connection
- hello-world-tinygo: A hello-world actor in TinyGo that responds over an HTTP connection
- hello-world-typescript: A hello-world actor in TypeScript that responds over an HTTP connection
- hello-world-python: A hello-world actor in Python that responds over an HTTP connection

If you do not specify a template with the `--template-name` argument, you will be prompted to select one. You will then have to name the project, and a new project template will be created in the current directory. The project name can also be specified earlier and be passed to `wash new actor <project-name>`.

#### Usage
```shell
wash new actor
wash new actor example-project
wash new actor example-project --template-name hello-world-rust
```

### `provider`
When creating a new provider project, a user may select from the following templates to create a skeleton:

- factorial-provider: A capability provider that computes factorials
- messaging-provider: A capability provider that implements pub-sub messaging

The user will then have to specify the name of the project and a vendor name, and a new project template will be created in the current directory. The project name can also be specified earlier and be passed to `wash new provider <project-name>`.

#### Usage
```shell
wash new provider
wash new provider example-project
wash new provider example-project --template-name factorial-provider
```

### `interface`
When creating a new interface project, a user may select from the following templates to create a skeleton:

- convertor-interface: An interface for actor-to-actor messages with a single convert method
- factorial-interface: An interface for a capability provider with capability contract

The user will then have to provide details such as project name, interface name and namespace prefix, and a new project template will be created in the current directory. The project name can also be specified earlier and be passed to `wash new interface <project-name>`.

#### Usage
```shell
wash new interface
wash new interface example-project
wash new interface example-project --template-name factorial-interface
```

#### Options
The following options can be used for all `wash new` subcommands:

`--git` Github repository url. Requires 'git' to be installed in PATH

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]

`--subfolder` Optional subfolder of the git repository

`--branch` Optional github branch. Defaults to "main"

`--path`  (Alias `-p`) Optional path for template project (alternative to --git)

`--values` (Alias `-v`) Optional path to file containing placeholder values

`--silent` Silent - do not prompt user. Placeholder values in the templates will be resolved from a '--values' file and placeholder defaults

`--favorites` Favorites file - to use for project selection

`--template-name` (Alias `-t`) Template name - name of template to use

`--no-git-init` Don't run 'git init' on the new folder