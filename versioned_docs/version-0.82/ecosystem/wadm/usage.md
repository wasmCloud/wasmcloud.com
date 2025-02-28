---
title: "Deploying Applications"
date: 2020-01-19T00:00:00+00:00
description: "Deploying your apps with wadm"
type: "docs"
sidebar_position: 3
---

<head>
  <meta name="robots" content="noindex">
</head>

Using `wadm` typically involves using the `wash` command line tool. However, you can also use wash's supporting library in your Rust application or, if you continue to the next section, you'll see the API reference if you want to interact with wadm directly over a NATS connection.

The following is an overview of the high level functionality exposed by `wadm`. To see the corresponding commands in the `wash` CLI, issue the following command:

```
wash app --help
```

Please refer the [CLI reference](../../cli/app.md) of `wash app` for a detailed usage guide.