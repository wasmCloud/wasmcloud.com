---
title: 'Introduction'
draft: false
sidebar_position: 0
description: 'The wasmCloud Shell (wash) CLI'
type: 'docs'
---

<head>
  <meta name="robots" content="noindex">
</head>

**_wash_** (the _wasmCloud Shell_) is a single command-line interface (CLI) to handle all of your wasmCloud tooling needs. This CLI has a number of sub-commands that help you interact with the wasmCloud ecosystem.

```
wash --help
```

`wash` has built-in help and you can follow any subcommand with `--help` to get more information about options available. For example `wash --help`, `wash ctl --help`, `wash up --help`, and `wash start actor --help` all provide contextual help.

To check the version of wash on you are running, run:

```
wash --version
wash -V
```

## Installation

`wash` can be installed from a binary release, or with cargo. See [installation](/docs/0.82/installation) for details.
