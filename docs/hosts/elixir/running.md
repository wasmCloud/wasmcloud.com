---
title: "Running the Host"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 11
draft: false
---

:::warning
wasmCloud's [Elixir host runtime](https://github.com/wasmcloud/wasmcloud-otp) has been deprecated. The [Rust wasmCloud runtime](https://github.com/wasmCloud/wasmCloud) is receiving all new features
:::

The wasmCloud host runtime is an [Elixir burrito](https://github.com/burrito-elixir/burrito) that allows us to package cross-platform Elixir releases. It's a self-extracting tarball that contains statically linked assets for the most portability, and for all intents and purposes it acts like a single binary. Executing a burrito works just like any other binary, except for the first time you execute it the burrito will extract the Elixir application files to an application directory on your machine.

## Installing

If you'd like to run the host without using [wash](/docs/installation), simply download the host according to your machine's operating system and architecture from the [wasmcloud-otp Releases page](https://github.com/wasmCloud/wasmcloud-otp/releases), add the executable flag, and then run it.

For example, on a Linux machine with the x86_64 architecture:

```bash
curl -fLO https://github.com/wasmCloud/wasmcloud-otp/releases/download/v0.63.0/wasmcloud_host_x86_64_linux_gnu
chmod +x wasmcloud_host_x86_64_linux_gnu
./wasmcloud_host_x86_64_linux_gnu
```

## Uninstalling

Elixir burritos have support for deleting extracted files with the `maintenance` command. Simply run the following command to remove extracted files:

```bash
./wasmcloud_host_x86_64_linux_gnu maintenance uninstall
```
