---
title: "Deploying Applications"
date: 2020-01-19T00:00:00+00:00
description: "Deploying your apps with wadm"
type: "docs"
sidebar_position: 3
---

:::warning[Planned changes to scheduling]
The [**wasmCloud Q3 2025 Roadmap**](https://github.com/orgs/wasmCloud/projects/7) sets out plans for an overhaul to scheduling in the next major release of wasmCloud. The new scheduling API will not use NATS to communicate between components by default, but will still support distributed communication via NATS. For more information, see the [Roadmap](https://github.com/orgs/wasmCloud/projects/7) and [Issue #4640: “Intentional distributed networking.”](https://github.com/wasmCloud/wasmCloud/issues/4640)
:::

Using wadm typically involves using the `wash` command line tool. However, you can also use wash's supporting library in your Rust application or interact with wadm directly over a NATS connection.

The following page on wadm API usage is an overview of the high-level functionality exposed by wadm. To see the corresponding commands in the `wash` CLI, issue the following command:

```shell
wash app --help
```

Please refer the [CLI reference](/docs/cli/wash#wash-app) of `wash app` for a detailed usage guide.
