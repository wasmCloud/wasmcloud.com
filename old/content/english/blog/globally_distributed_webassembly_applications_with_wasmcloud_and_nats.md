---
title: "Globally Distributed WebAssembly Applications with wasmCloud and NATS"
image: "images/blogs/ngs-global.png"
date: 2022-10-18T9:00:00-04:00
author: "Brooks Townsend"
author_profile: "https://linkedin.com/in/brooks-townsend"
description: "Taking a wasmCloud lattice from local to globally distributed with NATS and NGS"
categories: ["webassembly", "wasmcloud", "nats", "distributed", "lattice"]
draft: false
---

The first claim we make about wasmCloud on our documentation site is: "wasmCloud is a distributed platform..." The best definition I could find, on [Wikipedia](https://en.wikipedia.org/wiki/Distributed_computing) of course, is:

{{< aside >}}
Distributed computing is a field of computer science that studies distributed systems. A distributed system is a system whose components are located on different networked computers, which communicate and coordinate their actions by passing messages to one another from any system.
{{< /aside >}}

So, by the definition, as soon as we got two WebAssembly modules talking to each other on different networked computers we had a distributed system. Of course, we didn't stop there, and today we're going to walk through how you can run a global wasmCloud [lattice](https://wasmcloud.dev/reference/lattice/) using NATS and NGS.

# How we got to NATS

Back in the 0.18.0 days of wasmCloud we supported local host process calls which allowed developers to avoid installing NATS. Now, all wasmCloud hosts run atop NATS as a networking infrastructure that we call a [lattice](https://wasmcloud.dev/reference/lattice/). We've taken a stance _"compatible with, but not dependent upon"_ for as much as possible (Kubernetes, Docker, bare metal, IoT, nomad) so this is a significant choice, and today you'll see the reasons why.

We're going to do a brief introduction on the power of NATS, talk about how wasmCloud uses it, and then get into configuring it to connect wasmCloud compute anywhere.

# NATS, Leaf Nodes, and NGS

[NATS](https://nats.io/) describes itself as "Connective Technology for Adaptive Edge & Distributed Systems", which does as good of a job as you can to describe such a far-reaching technology. At its base level, NATS enables pub-sub and request-reply messaging on [subjects](https://docs.nats.io/nats-concepts/subjects). You run the NATS server binary, then connect clients to it over a TCP socket [^1] and can publish messages to any other client subscribed on a the same subject. NATS also includes an optional distributed persistence system called [Jetstream](https://docs.nats.io/nats-concepts/jetstream) and a fully-featured authn/authz [security](https://docs.nats.io/nats-concepts/security) system for additional reliability and configuration. There are plenty of features that NATS offers that are out of scope for this guide, but the NATS [documentation](https://docs.nats.io/) is a great place to find those. To sum it up, when you adopt NATS, you dramatically simplify your architecture and the number of tools you need to worry about.

A [Leaf Node](https://docs.nats.io/running-a-nats-service/configuration/leafnodes) _extends_ a centralized NATS infrastructure with a local NATS server, allowing you to perform additional authentication steps, route messages locally until they need to be delivered to the central infrastructure. This mechanism is not only efficient, it even allows messages to still flow during network disconnects by continuing to deliver messages locally without an upstream connection. We'll be using a Leaf Node today to extend [NGS](https://synadia.com/ngs), the NATS Global Service by [Synadia](https://synadia.com/), which is a NATS supercluster with connection points on the edge, providing low latency worldwide.

[^1]: NATS also accepts [connections](https://docs.nats.io/nats-concepts/connectivity) over TLS, WebSockets, and MQTT

# wasmCloud and NATS

wasmCloud uses NATS in a multitude of ways. To name a few:

1.  Request/reply messaging for remote procedure calls between actors and capability providers. Additionally this is used for the [control interface](https://github.com/wasmCloud/control-interface-client/), which allows for remote managing of actors, providers, and hosts via [wash](https://github.com/wasmCloud/wash).
2.  Jetstream to persist link definitions and claims so that they are durable and automatically delivered to new wasmCloud hosts joining an existing lattice
3.  Communication with a wasmCloud configuration service and the soon-to-come application deployment manager ([wadm](https://github.com/wasmCloud/wadm))

# Gathering Prerequisites

{{< aside >}}
⚠️ This post was updated on **11 Oct 2022** to include new conveniences like the `wash up` command. This requires at least `v0.12.0` and removes the need to install NATS or the wasmCloud host runtime manually.
{{< /aside >}}

This example requires a few prerequisites:

- The wasmCloud Shell, aka `wash`, from the wasmCloud [installation guide](https://wasmcloud.dev/overview/installation/). If you already have `wash` installed, use `wash --version` to ensure you have version `v0.12.0` or newer
- NATS account credentials to access NGS (we'll walk through this below)

We're also going to use a few files from the aptly named [ngs](https://github.com/wasmCloud/examples/tree/main/ngs) folder in our examples repository to deploy a Wasm microservice (we call this an [actor](https://wasmcloud.dev/reference/host-runtime/actors/)) that securely fetches a random image of a cat or a dog. Later on we're going to use some files in this folder, you can either clone this repository or just copy and paste as we go along.

To help illustrate the architecture of our application, take a look at this diagram:

![](../../images/blogs/ngs-global/excalidraw.png)

We'll have wasmCloud running both locally and in the cloud (or just on another machine), and we'll be spreading compute across these two wasmCloud hosts. Don't worry, you won't have to look up your local IP address or expose any ports, NATS makes distributed computing a breeze.

The first step will be to get yourself a set of NGS credentials. Navigate to [https://app.ngs.global](https://app.ngs.global) and select "Try It Out" under **Free**.
![](../../images/blogs/ngs-global/ngs-signup.png)

For simplicity, go ahead and name this account `wasmcloud` to keep it separate from any other NATS accounts you may create in the future.

![](../../images/blogs/ngs-global/ngs-account.png)

Proceed through the dialogues to sign in through your email until you reach the `Subscription Successful` page (keep in mind this is completely free, and you can't accidentally exceed your free tier limits). The last step in this process is to copy the `curl` command with your secret account key to install the NATS CLI and `nsc` to download your NGS credentials

![](../../images/blogs/ngs-global/ngs-curl.png)

{{< aside >}}**NOTE**:️ The 58 character key starting with `SA` is a secret (S) key for an account (A). You'll want to avoid sharing this value on Twitter or anywhere else public.{{< /aside >}}

Head back to your terminal and paste in that `curl` command. You'll see some output regarding the NATS install process, but all you really need is the last couple of lines:

```bash
NATS Configuration Context "synadia_wasmcloud_default"

      Description: synadia (Synadia Communications Inc.)
      Server URLs: tls://connect.ngs.global
      Credentials: /Users/brooks/.nkeys/creds/synadia/wasmcloud/default.creds (OK)
             Path: /Users/brooks/.config/nats/context/synadia_wasmcloud_default.json

nats-install: All set!
```

You can see here where the `Credentials` file is stored, that's what you'll use to authenticate to NGS. Keep this path in mind as we'll come back to it. You can do a quick request through the `nats` CLI to see that it's all working:

```bash
$ nats req ngs.echo 'Anyone out there?'
11:30:10 Sending request on "ngs.echo"
11:30:10 Received with rtt 21.005416ms
[Ohio, US]: "Anyone out there?"
```

# Running DogsAndCats on your Local Machine

Now that you have walked through the wasmCloud installation guide and have valid NGS credentials, we're ready to take wasmCloud global!

To start, let's get NATS, wasmCloud, and the DogsAndCats example running on our local machine. This is what you can think of as the local development setup for wasmCloud but instead of using a standalone NATS server we'll be using a leaf node that connects to NGS.

Go ahead and locate the `Credentials` file that you saw in the NGS install output to that directory as well. If you named your account `wasmcloud` like above, then it will be located under a folder called `.nkeys` in your **HOME** directory.

```bash
cat ~/.nkeys/creds/synadia/wasmcloud/default.creds
-----BEGIN NATS USER JWT-----
eyJ0...elided
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SU...elided
------END USER NKEY SEED------

*************************************************************
```

Here, we'll use `wash up` to launch a NATS leaf node connected over TLS to NGS and a wasmCloud host connected to that leaf node. We're going to use the account credentials you just generated to authenticate, and the wasmCloud logs will print directly to the terminal. To do so, we can specify the NGS address as the remote URL and your account credentials as the NATS credsfile:

```bash
wash up --nats-remote-url tls://connect.ngs.global --nats-credsfile ~/.nkeys/creds/synadia/wasmcloud/default.creds
```

You should see output like the following:

```plain
🏃 Running in interactive mode, your host is running at http://localhost:4000
🚪 Press `CTRL+c` at any time to exit
11:37:41.559 [info] Wrote "./host_config.json"
11:37:41.560 [info] Wrote "/Users/brooks/.wash/host_config.json"
11:37:41.560 [info] Connecting to control interface NATS without authentication
11:37:41.560 [info] Connecting to lattice rpc NATS without authentication
11:37:41.560 [info] Host NATWVDH3WZHYQQG3GFXPGRW5IAF5O4YCTMZ66LIM2WRSIVRDOTMIWN5Y (morning-moon-3881) started.
11:37:41.560 [info] Valid cluster signers: CD263EGQIG4DKCZAYV6ZMDAX3LOV4PKEGNCZF2THIYONC7W4CAXELVZZ
11:37:41.560 [warning] WARNING. You are using an ad hoc generated cluster seed.
For any other host or CLI tool to communicate with this host,
you MUST copy the following seed key and use it as the value
of the WASMCLOUD_CLUSTER_SEED environment variable:

SCAGI4US72YWQT6TAJBCK77XSOAJMWI5PCG5MICC3FWNRFQLHE53BEZIFU

You must also ensure the following cluster signer is in the list of valid
signers for any new host you start:

CD263EGQIG4DKCZAYV6ZMDAX3LOV4PKEGNCZF2THIYONC7W4CAXELVZZ


11:37:41.564 [info] Started wasmCloud OTP Host Runtime
11:37:41.566 [info] Running WasmcloudHostWeb.Endpoint with cowboy 2.9.0 at 0.0.0.0:4000 (http)
11:37:41.567 [info] Access WasmcloudHostWeb.Endpoint at http://localhost:4000
11:37:41.665 [info] Lattice cache stream created or verified as existing (0 consumers).
11:37:41.665 [info] Attempting to create ephemeral consumer (cache loader)
11:37:41.667 [info] Created ephemeral consumer for lattice cache loader
```

From this command output, go ahead and save your 58 character cluster seed starting with **SC** (it will be different than the seed in the sample output above). We're going to use it again later.

You now have a running wasmCloud host using NGS as the lattice infrastructure! Even though we're connected to NGS, our leaf node is smart enough to always route traffic locally if possible, saving the overhead of a remote network hop. This is key for enabling wasmCloud to function even if you lose connectivity to NGS briefly, all actors and providers on a host will continue as if nothing happened.

We can continue by deploying our ngs application from the examples repository which consists of: our DogsAndCats actor, a capability provider that implements the `wasmcloud:httpserver` contract and a capability provider that implements the `wasmcloud:httpclient` contract, both of which we provide as wasmCloud first-party providers but could be swapped to any other implementation at runtime.

```bash
wash start actor wasmcloud.azurecr.io/dogs-and-cats:0.1.0
wash link put MCUCZ7KMLQBRRWAREIBQKTJ64MMQ5YKEGTCRGPPV47N4R72W2SU3EYMU VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M wasmcloud:httpserver ADDRESS=0.0.0.0:8081
wash link put MCUCZ7KMLQBRRWAREIBQKTJ64MMQ5YKEGTCRGPPV47N4R72W2SU3EYMU VCCVLH4XWGI3SGARFNYKYT2A32SUYA2KVAIV2U2Q34DQA7WWJPFRKIKM wasmcloud:httpclient
wash start provider wasmcloud.azurecr.io/httpserver:0.15.0
wash start provider wasmcloud.azurecr.io/httpclient:0.4.0
```
:::info
Previous guides used `wash ctl start` and `wash ctl link` which is deprecated and will be
replaced by `wash start` and `wash link` respectively in a future version.
See [the wash command refactoring RFC](https://github.com/wasmCloud/wash/issues/538) for more information and to provide feedback
:::

Once everything completes, check out a pet picture at [http://127.0.0.1:8081](http://127.0.0.1:8081)! You can refresh to your heart's desire to see pictures of cats and dogs, and you've deployed your application on wasmCloud.

[^2]: When using Jetstream domains, NATS maps some internally used topics to use the topic specific to that Jetstream domain. At the wasmCloud level, this would enable you to reuse the same NATS infrastructure on completely different domains and lattice prefixes for multi-tenancy, but it's not necessary to know these details for today's example.

# Turning the Knob from Local to Global

For this step you're going to need another computer. This can be a Cloud VM, a Docker container, or even your friends laptop. The architecture can be x86_64 or aarch64, and the operating system can be Macos, Windows, or Linux. The instructions are all the same regardless of your choice (thanks WebAssembly!) For today, I chose to do this on a Google Cloud Platform e2 micro instance which is included in their [free](https://cloud.google.com/free) tier.

You'll want to get terminal access to to your new machine and then follow the wasmCloud [installation guide](https://wasmcloud.dev/overview/installation/) `wash` as you did before. You'll need a few pieces of information to ensure this host can properly join your lattice:

### **default.creds**

This is the same set of credentials you used in the previous step, located under `~/.nkeys/creds/synadia/wasmcloud/default.creds` if your account name is `wasmcloud`. The values contained inside of the credsfile can be supplied manually to connect, but for simplicity we recommend just copying it over to your second machine.

### **Cluster Seed**

wasmCloud uses a cluster seed to sign and verify each invocation (e.g. `HttpServer.HandleRequest`) in wasmCloud. This is a part of wasmCloud's [zero-trust security model](https://wasmcloud.dev/app-dev/secure/clusterkeys/) and any invocations that aren't signed with a verified issuer (e.g. from an unknown host) will be denied before it even reaches the actor / provider. This can be found in the output of your `wash up` command that you ran earlier as the 58 character seed starting with **SC**.

Other than that, both hosts will use the default values from `wash up` like the JetStream domain (core) and lattice prefix (default). You can run the following command to launch your second host, which specifies a label, the cluster seed, and a separate JetStream domain for the _leaf node_ to allow your locally launched host to remain as the "primary" node:

```bash
HOST_machine=second wash up --nats-remote-url tls://connect.ngs.global --nats-credsfile ./default.creds --cluster-seed SCAGI4US72YWQT6TAJBCK77XSOAJMWI5PCG5MICC3FWNRFQLHE53BEZIFU --nats-js-domain extender --wasmcloud-js-domain core
```

You should see a similar dump of logs, but notably you should see that you are connecting to a stream with one consumer (your local machine)

```plain
16:06:22.896 [info] Lattice cache stream created or verified as existing (1 consumers).
```

And now, on your local machine, check out [http://localhost:4000](http://localhost:4000). You should see your DogsAndCats resources and additionally under your **Host Info** section you'll see two hosts:

![](../../images/blogs/ngs-global/dashboard.png)

We can go ahead and schedule a few extra replicas of the DogsAndCats actor on the cloud host and an HTTPClient provider using `wash` or by using the dashboard. These commands can be run with `wash` on either machine, the result is the same!

```bash
# The constraint flag ensures we start on a host with that label
wash start actor wasmcloud.azurecr.io/dogs-and-cats:0.1.0 --constraint machine=second
wash start provider wasmcloud.azurecr.io/httpclient:0.4.0 --constraint machine=second
```

We've now transformed this app from running as a monolith to running distributed across two machines, with resources running both local and in the cloud. You can even remove the DogsAndCats actor from your local machine and everything will immediately failover to the cloud.

# Wrapping up

In this guide we used NGS and NATS Leaf Nodes to connect two wasmCloud hosts; one running locally and one running in the cloud. This guide demonstrated how you can run multiple instances of actors and different capability providers _anywhere_ and how you, the developer, don't need to change your business logic to make this happen. We're all about making our developer experience world-class, and that means zero code changes from local development to running across different clouds with highly distributed infrastructure. To drive this home, here's few things that you didn't have to deal with today: IP addresses, security group rules, load balancing requests, failover logic, NATS cluster setup, configuring TLS communications, and of course recompiling for different architectures / operating systems. All of those are taken care of by the NATS and wasmCloud.

We used the NGS free tier to simplify the infrastructure setup, though it's worth noting that NGS is not a required component of this architecture. You can replace NGS with any NATS [cluster](https://docs.nats.io/running-a-nats-service/configuration/clustering) and the result is the same, there's no required cost to connect more than two hosts together.

If you'd like to see the next level of this NGS + Leaf Node setup with wasmCloud, check out [Disrupting the Downtime Continuum](https://www.youtube.com/watch?v=wjwKmq16shI) the talk Taylor and I gave last KubeCon EU where we used these instructions with one more leaf node and demonstrated live fail over between clouds with wasmCloud.

We're looking forward to seeing what you can do with this guide! If you give this a try and do something awesome or need any assistance, join our community [Slack](https://slack.wasmcloud.com/) or open an issue on our wasmCloud [repository](https://github.com/wasmCloud/wasmCloud).
