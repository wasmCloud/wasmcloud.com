---
title: 'Components (wit)'
date: 2018-12-29T11:02:05+06:00
sidebar_position: 4
draft: false
description: 'Support for wit-defined WebAssembly components'
---

<head>
  <meta name="robots" content="noindex" />
</head>

The [WebAssembly component model](https://github.com/WebAssembly/component-model) holds the promise of ushering in an even more powerful programming paradigm than WebAssembly modules. With components, we can bolt together incredible new forms of compute from small building blocks. For more information on our thoughts on the component model's future, check out the blog post [For the wit!](https://cosmonic.com/blog/engineering/for-the-wit-my-first-day-with-components)

The wasmCloud host has added **_experimental_** support for WebAssembly components. As the specification and tooling around components and the component model stabilize, we will gradually improve our support for components. Until then, we recommend that you utilize our [Stable ABI](/docs/0.82/hosts/abis/wasmbus), which will still be supported even after components are the default.
