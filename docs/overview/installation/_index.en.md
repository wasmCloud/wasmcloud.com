---
title: "Installation"
date: 2018-12-29T11:02:05+06:00
weight: 1
draft: false
---

We will guide you through installation of `wash`, the wasmCloud Shell, which gives you the tools to install, run, and develop with wasmCloud.

{{% tabs %}}
{{% tab "Ubuntu/Debian" %}}

```bash
curl -s https://packagecloud.io/install/repositories/wasmcloud/core/script.deb.sh | sudo bash
sudo apt install wash
```

{{% /tab %}}
{{% tab "Fedora" %}}

```bash
curl -s https://packagecloud.io/install/repositories/wasmcloud/core/script.rpm.sh | sudo bash
sudo dnf install wash
```

{{% /tab %}}
{{% tab "snap" %}}

```bash
snap install wash --devmode --edge
```

{{% /tab %}}
{{% tab "MacOS" %}}

```bash
brew tap wasmcloud/wasmcloud
brew install wash
```

{{% /tab %}}
{{% tab "Windows" %}}

```bash
choco install wash
```

{{% /tab %}}
{{% tab "Rust" %}}

If your platform isn't listed, `wash` can be installed with `cargo`

```bash
cargo install wash-cli
```

{{% /tab %}}
{{% tab "Source" %}}

The [wash](https://github.com/wasmcloud/wash) repository is open source on GitHub and can be cloned and built locally directly. With a Rust toolchain, `wash` is easy to build from source

```bash
git clone https://github.com/wasmcloud/wash.git
cd wash
cargo build --release
./target/release/wash
```

{{% /tab %}}
{{% /tabs %}}

Once `wash` is installed, simply run `wash up`. This will download and start NATS and wasmCloud for you, printing logs to the terminal. You can exit at any time by pressing `ctrl-c`. Now, you're ready to proceed onto [Getting started](/docs/getting-started.mdx).

> For convenience we provide a Docker Compose file if you prefer to use Docker instead of `wash up` to launch NATS and wasmCloud. You can follow our [install with Docker](./install-with-docker/) instructions to do so, but it's still recommended to install `wash` even if you don't make use of the `up` feature.
