---
title : "Going Global with wasmCloud and NATS"
image : "images/blogs/ngs-global.png"
date: 2022-06-29T9:00:00-04:00
author: "Brooks Townsend"
author_profile: "https://linkedin.com/in/brooks-townsend"
description : "Taking a local wasmCloud lattice to globally distributed with NATS and NGS"
categories: ["webassembly", "wasmcloud", "nats", "distributed", "lattice"]
draft : false
---

The first claim we make about wasmCloud on our documentation site is: "wasmCloud is a distributed platform..." The best definition I could find, on [Wikipedia](https://en.wikipedia.org/wiki/Distributed_computing) of course, is:

{{< aside >}}
Distributed computing is a field of computer science that studies distributed systems. A distributed system is a system whose components are located on different networked computers, which communicate and coordinate their actions by passing messages to one another from any system.
{{< /aside >}}

So, by the definition, as soon as we got two WebAssembly modules talking to each other on different networked computers we had a distributed system. Of course, we didn't stop there, and today we're going to walk through how you can run a global wasmCloud [lattice](https://wasmcloud.dev/reference/lattice/) using NATS and NGS.

# How we got to NATS

Back in the 0.18.0 days of wasmCloud we supported local host process calls which allowed developers to avoid installing NATS. Now, all wasmCloud hosts run atop NATS as a networking infrastructure that we call a [lattice](https://wasmcloud.dev/reference/lattice/). We've taken a stance *"compatible with, but not dependent upon"* for as much as possible (Kubernetes, Docker, bare metal, IoT, nomad) so this is a significant choice, and today you'll see the reasons why.

  

We're going to do a brief introduction on the power of NATS, talk about how wasmCloud uses it, and then get into configuring it to connect wasmCloud compute anywhere.

  

# NATS, Leaf Nodes, and NGS (oh my!)

[NATS](https://nats.io/) describes itself as "Connective Technology for Adaptive Edge & Distributed Systems", which does as good of a job as you can to describe such a far-reaching technology. At its base level, NATS enables pub-sub and request-reply messaging on [subjects](https://docs.nats.io/nats-concepts/subjects). You run the NATS server binary, then connect clients to it over a TCP socket [^1] and can publish messages to any other client subscribed on a the same subject. NATS also includes an optional distributed persistence system called [Jetstream](https://docs.nats.io/nats-concepts/jetstream) and a fully-featured authn/authz [security](https://docs.nats.io/nats-concepts/security) system for additional reliability and configuration. There are plenty of features that NATS offers that are out of scope for this guide, but the NATS [documentation](https://docs.nats.io/) is a great place to find those. To sum it up, when you adopt NATS, you dramatically simplify your architecture and the number of tools you need to worry about.

  

A [Leaf Node](https://docs.nats.io/running-a-nats-service/configuration/leafnodes) _extends_ a centralized NATS infrastructure with a local NATS server, allowing you to perform additional authentication steps, route messages locally until they need to be delivered to the central infrastructure. This mechanism is not only efficient, it even allows messages to still flow during network disconnects by continuing to deliver messages locally without an upstream connection. We'll be using a Leaf Node today to extend [NGS](https://synadia.com/ngs), the NATS Global Service by [Synadia](https://synadia.com/), which is a NATS supercluster with connection points on the edge, providing low latency worldwide.

  

[^1]: NATS also accepts [connections](https://docs.nats.io/nats-concepts/connectivity) over TLS, WebSockets, and MQTT

  

# wasmCloud and NATS

wasmCloud uses NATS in a multitude of ways. To name a few:

1.  Request/reply messaging for remote procedure calls between actors and capability providers. Additionally this is used for the [control interface](https://github.com/wasmCloud/control-interface-client/), which allows for remote managing of actors, providers, and hosts via [wash](https://github.com/wasmCloud/wash).
2.  Jetstream to persist link definitions and claims so that they are durable and automatically delivered to new wasmCloud hosts joining an existing lattice
3.  Communication with a wasmCloud configuration service and the soon-to-come application deployment manager ([wadm](https://github.com/wasmCloud/wadm))

  

# Gathering Prerequisites

This example requires a few prerequisites:

*   The components in the wasmCloud [installation guide](https://wasmcloud.dev/overview/installation/), which includes `wash` , the wasmCloud host runtime, and the `nats-server` binary.
*   NATS account credentials to access NGS (we'll walk through this below)

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

  

Go ahead and download [core.cfg](https://github.com/wasmCloud/examples/tree/main/ngs/core.cfg) to the same directory that you installed wasmCloud. Then, copy the `Credentials` file that you saw in the NGS install output to that directory as well. If you named your account `wasmcloud` like above, then you can copy it with this command (assuming you're in the wasmCloud install directory):

```bash
cp ~/.nkeys/creds/synadia/wasmcloud/default.creds ./
```

Your filesystem should look like this:

```bash
~/github.com/wasmcloud/examples/ngs/wasmcloud ➜ ls -lah
Permissions Size User   Date Modified Name
drwxr-xr-x     - brooks 27 Jun 15:50  bin
.rw-r--r--   175 brooks 27 Jun 15:48  core.cfg
.rw-------   977 brooks 27 Jun 15:55  default.creds
drwxr-xr-x     - brooks 27 Jun 15:50  erts-12.3.1
drwxr-xr-x     - brooks 27 Jun 15:50  lib
drwxr-xr-x     - brooks 27 Jun 15:50  releases
```

Taking a look at the NATS config, you'll see that we're starting a leaf node with the Jetstream domain `core` and will connect over TLS using your account credentials:

```go
jetstream {
    domain=core
}
leafnodes {
    remotes = [ 
        { 
          url: "tls://connect.ngs.global"
          credentials: "./default.creds"
        }
    ]
}
```

You can run NATS with the simple one-liner:

```bash
nats-server --config core.cfg
```

You'll see some output including some sweet ASCII art, Jetstream information, and additional information around Jetstream domain mappings [^2]. I've omitted the timestamps for better rendering on this post but they should show for you before each log.

  

```plain
Starting nats-server
  Version:  2.8.4
  Git:      [not set]
  Name:     NC4QUMEPGQQYZY3UOTN6TNKHCYV67Q7O7NRNMJR37IGQKGZ4MNXCLJUE
  Node:     1TtKtTGV
  ID:       NC4QUMEPGQQYZY3UOTN6TNKHCYV67Q7O7NRNMJR37IGQKGZ4MNXCLJUE
Using configuration file: core.cfg
Starting JetStream
    _ ___ _____ ___ _____ ___ ___   _   __  __
 _ | | __|_   _/ __|_   _| _ \ __| /_\ |  \/  |
| || | _|  | | \__ \ | | |   / _| / _ \| |\/| |
 \__/|___| |_| |___/ |_| |_|_\___/_/ \_\_|  |_|

         https://docs.nats.io/jetstream

---------------- JETSTREAM ----------------
  Max Memory:      12.00 GB
  Max Storage:     281.11 GB
  Store Directory: "/var/folders/nz/dl25872x06x5k8bl6cz1rt5c0000gn/T/nats/jetstream"
  Domain:          core
-------------------------------------------
Listening for client connections on 0.0.0.0:4222
Server is ready
3.19.121.231:7422 - lid:4 - Leafnode connection created for account: $G 
3.19.121.231:7422 - lid:4 - JetStream Not Extended, adding deny [$JS.API.> $KV.> $OBJ.>] for account "$G"
3.19.121.231:7422 - lid:4 - Adding JetStream Domain Mapping "$JS.core.API.META.>" -> $JS.API.META.> to account "$G"
3.19.121.231:7422 - lid:4 - Adding JetStream Domain Mapping "$JS.core.API.SERVER.>" -> $JS.API.SERVER.> to account "$G"
...
```

Now, launch a separate terminal window and use it to launch wasmCloud with the `core` jetstream domain:

```bash
WASMCLOUD_JS_DOMAIN=core ./bin/wasmcloud_host foreground
```
{{< aside >}}If you're on **Windows**, you can run this same command with the Powershell environment syntax:
```powershell
$env:WASMCLOUD_JS_DOMAIN='core'; .\bin\wasmcloud_host foreground
```
{{< /aside >}}

You should see output like the following:
```plain
17:13:01.549 [info] Using JetStream domain: core
17:13:02.717 [info] Wrote "./host_config.json"
17:13:02.719 [info] Wrote "/Users/brooks/.wash/host_config.json"
17:13:02.722 [info] Connecting to control interface NATS without authentication
17:13:02.722 [info] Connecting to lattice rpc NATS without authentication
17:13:02.723 [info] Host NAWSYD7S4G5HUQ4T5BW2UR3ARYAPNW2W2KNHDRMXTJFKGBNAK6UPMVII (winter-feather-2030) started.
17:13:02.724 [info] Valid cluster signers: CBPH74Z2PH62PJ5QWVKMJKI22EV4O2IRHKVULDZBAO35CUP6V67FXPTH
17:13:02.724 [warning] WARNING. You are using an ad hoc generated cluster seed.
For any other host or CLI tool to communicate with this host,
you MUST copy the following seed key and use it as the value
of the WASMCLOUD_CLUSTER_SEED environment variable:

SCAKOR4ZZR7DKEHEZ47TFAODPHTHPUGQST4A4IN2OD55WD7IHMWWKGOGMY

You must also ensure the following cluster signer is in the list of valid
signers for any new host you start:

CBPH74Z2PH62PJ5QWVKMJKI22EV4O2IRHKVULDZBAO35CUP6V67FXPTH


17:13:02.803 [info] Started wasmCloud OTP Host Runtime
17:13:02.805 [info] Running WasmcloudHostWeb.Endpoint with cowboy 2.9.0 at :::4000 (http)
17:13:02.807 [info] Access WasmcloudHostWeb.Endpoint at http://localhost:4000
17:13:02.907 [info] Lattice cache stream created or verified as existing (0 consumers).
17:13:02.907 [info] Attempting to create ephemeral consumer (cache loader)
17:13:02.912 [info] Created ephemeral consumer for lattice cache loader
```

You now have a running wasmCloud host using NGS as the lattice infrastructure! Note that in this same directory there is now a `host_config.json` file which contains all of the configuration values we used to launch this host. We'll come back to that file a little later.

  

We can continue by deploying our ngs application from the examples repository which consists of: our DogsAndCats actor, a capability provider that implements the `wasmcloud:httpserver` contract and a capability provider that implements the `wasmcloud:httpclient` contract, both of which we provide as wasmCloud first-party providers but could be swapped to any other implementation at runtime.

```bash
wash ctl start actor wasmcloud.azurecr.io/dogsandcats:0.1.0
wash ctl link put MCUCZ7KMLQBRRWAREIBQKTJ64MMQ5YKEGTCRGPPV47N4R72W2SU3EYMU VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M wasmcloud:httpserver ADDRESS=0.0.0.0:8081
wash ctl link put MCUCZ7KMLQBRRWAREIBQKTJ64MMQ5YKEGTCRGPPV47N4R72W2SU3EYMU VCCVLH4XWGI3SGARFNYKYT2A32SUYA2KVAIV2U2Q34DQA7WWJPFRKIKM wasmcloud:httpclient
wash ctl start provider wasmcloud.azurecr.io/httpserver:0.15.0
wash ctl start provider wasmcloud.azurecr.io/httpclient:0.4.0
```

Once everything completes, check out a pet picture at [http://127.0.0.1:8081](http://127.0.0.1:8081)! You can refresh to your heart's desire to see pictures of cats and dogs, and you've deployed your application on wasmCloud.

  

[^2]: When using Jetstream domains, NATS maps some internally used topics to use the topic specific to that Jetstream domain. At the wasmCloud level, this would enable you to reuse the same NATS infrastructure on completely different domains and lattice prefixes for multi-tenancy, but it's not necessary to know these details for today's example.

  

# Turning the Knob from Local to Global

For this step you're going to need another computer. This can be a Cloud VM, a Docker container, or even your friends laptop. The architecture can be x86\_64 or aarch64, and the operating system can be Macos, Windows, or Linux. The instructions are all the same regardless of your choice (thanks WebAssembly!) For today, I chose to do this on a Google Cloud Platform e2 micro instance which is included in their [free](https://cloud.google.com/free) tier.

  

You'll want to get terminal access to to your new machine and then follow the wasmCloud [installation guide](https://wasmcloud.dev/overview/installation/) to download `nats-server` and the wasmCloud host. You don't need `wash` installed on that machine. Once you've done that, upload (copy/paste) the following files up to your second machine:

### **extender.cfg**

Found [here](https://github.com/wasmCloud/examples/tree/main/ngs/extender.cfg), this config looks like:

```go
jetstream {
    domain=extender
}
leafnodes {
    remotes = [ 
        { 
          url: "tls://connect.ngs.global"
          credentials: "./default.creds"
        }
    ]
}
```

### **default.creds**

This is the same set of credentials you used in the previous step, located under `~/.nkeys/creds/synadia/wasmcloud/default.creds` if your account name is `wasmcloud`.

  

### **host\_config.json**

This was automatically created for you once you launched the host on your local machine. This file contains a few different values that are important for running multiple wasmCloud hosts in the same lattices:

1.  `js_domain` to ensure all hosts are registering consumers for the same Jetstream domain
2.  `lattice_prefix` to ensure all actors and providers subscribe to the same topics
3.  `cluster_seed` & `cluster_issuers` to sign and verify each invocation in wasmCloud. This is required as wasmCloud operates with a [zero-trust security model](https://wasmcloud.dev/app-dev/secure/clusterkeys/) and any invocations that aren't signed with a verified issuer will be denied before it even reaches the actor / provider.

  

Once you've copied over your files, your file tree should look something like this:

```bash
brooks@instance-2:~/wasmcloud$ ls -lah
total 12M
drwxr-xr-x  6 brooks brooks 4.0K Jun 29 15:35 .
drwxr-xr-x  6 brooks brooks 4.0K Jun 29 15:34 ..
drwxr-xr-x  2 brooks brooks 4.0K Jun 29 15:32 bin
-rw-r--r--  1 brooks brooks  978 Jun 29 15:35 default.creds
drwxr-xr-x  8 brooks brooks 4.0K Jun 29 15:32 erts-12.3.2
-rw-r--r--  1 brooks brooks  176 Jun 29 15:35 extender.cfg
-rw-r--r--  1 brooks brooks  590 Jun 29 15:35 host_config.json
drwxr-xr-x 63 brooks brooks 4.0K Jun 29 15:32 lib
-rwxr-xr-x  1 brooks brooks  12M Jun 29 15:35 nats-server
drwxr-xr-x  3 brooks brooks 4.0K Jun 29 15:32 releases
```

We can now start NATS in the background so that you don't need to `ssh` again:

```bash
nats-server --config extender.cfg 2> nats_logs.txt
```

And then your wasmCloud host (with a label so we can easily differentiate it):

```bash
HOST_machine=second ./bin/wasmcloud_host foreground
```
{{< aside >}}If you're on **Windows**, you can run this same command with the Powershell environment syntax:
```powershell
$env:HOST_machine='second'; .\bin\wasmcloud_host foreground
```
{{< /aside >}}

You should see a similar dump of logs, but notably you should see that you are connecting to a stream with one consumer (your local machine)

```plain
16:06:22.896 [info] Lattice cache stream created or verified as existing (1 consumers).
```

And now, on your local machine, check out [http://localhost:4000](http://localhost:4000). You should see your DogsAndCats resources and additionally under your **Host Info** section you'll see two hosts:

**TODO: screenshot with real actor ID**

We can go ahead and schedule a few extra replicas of the DogsAndCats actor on the cloud host and an HTTPClient provider using `wash` or by using the dashboard.

```bash
# The constraint flag ensures we start on a host with that label
wash ctl start actor wasmcloud.azurecr.io/dogsandcats:0.1.0 --constraint machine=second
wash ctl start provider wasmcloud.azurecr.io/httpclient:0.4.0 --constraint machine=second
```

We've now transformed this app from running as a monolith to running distributed across two machines, with resources running both local and in the cloud. You can even remove the DogsAndCats actor from your local machine and everything will immediately failover to the cloud.

# Wrapping up

In this guide we used NGS and NATS Leaf Nodes to connect two wasmCloud hosts; one running locally and one running in the cloud. This guide demonstrated how you can run multiple instances of actors and different capability providers _anywhere_ and how you, the developer, don't need to change your business logic to make this happen. We're all about making our developer experience world-class, and that means zero code changes from local development to running across different clouds with highly distributed infrastructure. To drive this home, here's few things that you didn't have to deal with today: IP addresses, security group rules, load balancing requests, failover logic, NATS cluster setup, configuring TLS communications, and of course recompiling for different architectures / operating systems. All of those are taken care of by the NATS and wasmCloud.

We used the NGS free tier to simplify the infrastructure setup, though it's worth noting that NGS is not a required component of this architecture. You can replace NGS with any NATS [cluster](https://docs.nats.io/running-a-nats-service/configuration/clustering) and the result is the same, there's no required cost to connect more than two hosts together.

If you'd like to see the next level of this NGS + Leaf Node setup with wasmCloud, check out [Disrupting the Downtime Continuum](https://www.youtube.com/watch?v=wjwKmq16shI) the talk Taylor and I gave last KubeCon EU where we used these instructions with one more leaf node and demonstrated live fail over between clouds with wasmCloud.
  

We're looking forward to seeing what you can do with this guide! If you give this a try and do something awesome or need any assistance, join our community [Slack](https://slack.wasmcloud.com/) or open an issue on our wasmCloud [repository](https://github.com/wasmCloud/wasmCloud).