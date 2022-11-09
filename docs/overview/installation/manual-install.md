---
title: "Manual Install"
date: 2022-08-29T11:02:05+06:00
weight: 2
draft: false
---

As of `wash` **v0.12.0**, `wash up` will install a NATS server and wasmCloud for you, however it's still valuable to keep instructions on installing both manually for a minimal server install.

### Install NATS server

NATS is a powerful, cloud native message broker that aims to provide a universal communications substrate across all kinds of workloads. NATS is such a resilient, fast, small, flexible tool that it is part of the core infrastructure requirements of the wasmCloud host. For information on how to install and start the NATS server, please check the [NATS Documentation](https://docs.nats.io/nats-server/installation). Note that we require a version of NATS new enough to contain the embedded _JetStream_ functionality.

Installing NATS is quick and easy. Once it's installed, run it with JetStream enabled (you'll know you did it correctly when you see some sweet terminal ASCII art):

```plain
nats-server --jetstream
...
... Starting JetStream
...     _ ___ _____ ___ _____ ___ ___   _   __  __
...  _ | | __|_   _/ __|_   _| _ \ __| /_\ |  \/  |
... | || | _|  | | \__ \ | | |   / _| / _ \| |\/| |
...  \__/|___| |_| |___/ |_| |_|_\___/_/ \_\_|  |_|
...
```

### Install and start the wasmCloud host runtime

The preferred way to install the wasmCloud host runtime is to download the latest [release](https://github.com/wasmCloud/wasmcloud-otp/releases). Follow the instructions below for your platform to download and extract wasmCloud.

{{% tabs %}}
{{% tab "x86_64 Linux" %}}

```bash
wget https://github.com/wasmCloud/wasmcloud-otp/releases/download/v0.57.0/x86_64-linux.tar.gz
mkdir -p wasmcloud
tar -xvf x86_64-linux.tar.gz -C wasmcloud
```

{{% /tab %}}
{{% tab "arm64 Linux" %}}

```bash
wget https://github.com/wasmCloud/wasmcloud-otp/releases/download/v0.57.0/aarch64-linux.tar.gz
mkdir -p wasmcloud
tar -xvf aarch64-linux.tar.gz -C wasmcloud
```

{{% /tab %}}
{{% tab "Intel Mac" %}}

```bash
wget https://github.com/wasmCloud/wasmcloud-otp/releases/download/v0.57.0/x86_64-macos.tar.gz
mkdir -p wasmcloud
# This command makes it so the MacOS Gatekeeper will not quarantine parts of the host when you run it:
sudo xattr -d com.apple.quarantine x86_64-macos.tar.gz
tar -xvf x86_64-macos.tar.gz -C wasmcloud
```

{{% /tab %}}
{{% tab "M1 Mac" %}}

```bash
wget https://github.com/wasmCloud/wasmcloud-otp/releases/download/v0.57.0/aarch64-macos.tar.gz
mkdir -p wasmcloud
# This command makes it so the MacOS Gatekeeper will not quarantine parts of the host when you run it:
sudo xattr -d com.apple.quarantine aarch64-macos.tar.gz
tar -xvf aarch64-macos.tar.gz -C wasmcloud
```

{{% /tab %}}
{{% tab "Windows" %}}

```powershell
wget https://github.com/wasmCloud/wasmcloud-otp/releases/download/v0.57.0/x86_64-windows.tar.gz
mkdir wasmcloud
tar -xvf x86_64-windows.tar.gz -C wasmcloud
```

{{% /tab %}}
{{% /tabs %}}

After extracting from the tar file, the host is fully installed, and the tar file can be deleted. If you haven't already, run NATS with Jetstream following the instructions [above](#install-nats-server).

There are a variety of ways to run the host that are described in more detail in [Running the Host](/docs/reference/host-runtime/running). For now, go ahead and `cd wasmcloud` to get into the correct directory and then run:

```bash
bin/wasmcloud_host foreground
```

This will start the host with attached logs and can be exited at any time by doing `ctrl-c`. Now, you're ready to proceed onto [Getting started](/docs/getting-started.mdx).

### Stopping the wasmCloud Host Runtime

There are a number of ways you can stop the runtime, and the recommendation varies with how you started the host. For details, see the [safe shutdown](/docs/reference/host-runtime/safeshutdown) section of the reference guide.
