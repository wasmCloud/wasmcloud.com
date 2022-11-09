---
title: "Getting started"
date: 2018-12-29T11:02:05+06:00
weight: 2
draft: false
---

In this guide, we'll be taking a tour through some of the most common activities in the wasmCloud ecosystem, like starting and configuring [actors](../../reference/host-runtime/actors/) and [capability providers](../../reference/host-runtime/capabilities/). We will save the guides for actually writing code for actors and providers for later, after you're familiar with the tooling and starting and stopping the runtime.

You should have already followed the [installation guide](../installation/) to install `wash` and ran the applicable command to start wasmCloud.

> **A note on log files**:
> If you do encounter any problems, the host log files will contain useful error messages, and it's good to know how to find them. The tabs below, organized by how you started the wasmCloud host, show you where to find logs:

{{% tabs %}}
{{% tab " wash up" %}}
Logs with `wash up` are automatically output to your terminal, unless you ran the command with the `--detach` flag. Logs from detached hosts can be found in `~/.wash/downloads/wasmcloud.log`
{{% /tab %}}
{{% tab "Docker" %}}
Logs from hosts running in Docker, if started with our docker compose, can be found by running `docker logs wasmcloud`
{{% /tab %}}
{{% tab "Manual" %}}
If you manually installed the host from a downloaded release, look in `tmp/log/erlang.log.1` relative to the folder where you extracted the release tar file.
{{% /tab %}}
{{% /tabs %}}

### Viewing the wasmCloud dashboard

Open a browser tab to the URL [http://localhost:4000](http://localhost:4000). This is the _wasmCloud dashboard_, a GUI that you will use quite often as you learn to build distributed applications in this ecosystem.

![dashboard1](./washboard1.png)

Make sure that you've got port **4000** available or you likely won't see the wasmCloud dashboard. If you need to change the port number, you can set the environment variable `PORT` to the new number and re-start the host with that environment variable in scope.

To see a list of running hosts, issue the following command in a terminal window (`wash` should be in your path):

```shell
wash ctl get hosts
```
```shell
⢈⠩  Retrieving Hosts ...

  Host ID                                                    Uptime (seconds)
  NCPGH5CVPO3BAZ5OSQKXYHDKPBT3JXLG5EAOTG7XOXUWJ6AHZCFT57SI   711
```

You should see one host running, and you can view its inventory by running the following command with the **Host ID** found in the Output window (make sure you use _your_ host and not the one in this guide):

```shell
wash ctl get inventory NCPGH5CVPO3BAZ5OSQKXYHDKPBT3JXLG5EAOTG7XOXUWJ6AHZCFT57SI
```

You'll see output similar to the following (your host key will be different):

```shell
 Host Inventory (NCPGH5CVPO3BAZ5OSQKXYHDKPBT3JXLG5EAOTG7XOXUWJ6AHZCFT57SI)

  hostcore.os                           linux
  hostcore.osfamily                     unix
  hostcore.arch                         x86_64

  No actors found

  No providers found
```

Currently on this host, we have a few labels that show the environment this host is running on, and no capability providers. All wasmCloud hosts set the `hostcore.*` labels, which are available in auctions (discussed in the [reference guide](/reference/lattice/auctions).

The terminal output you've seen so far is also reflected in the GUI. Throughout our guides and tutorials we may alternate between the wasmCloud dashboard UI and terminal-based CLI to reinforce that everything you can do in one view, you can do in the other.

#### Running an actor

We could start scheduling actors and providers right away on this host using the `wash ctl start` command, but we'll use the dashboard UI for now. Using the web UI, click the **Start Actor** button and choose the _From Registry_ option. When prompted for an OCI reference URL, enter `wasmcloud.azurecr.io/echo:0.3.4` and for now just choose **1** for the number of replicas. After just a few moments, you should have a running actor in your environment. As soon as the system conducts its next periodic health check, the actor's status should change from Awaiting to Healthy.

![dashboard2](./washboard2.png)

#### Running a capability provider

For this actor to receive HTTP requests, we need to start the HTTP Server capability provider. Actors are signed WebAssembly modules, and as such they have embedded claims declaring their ability to communicate with capability providers like the HTTP Server. Actors cannot communicate with any capability provider for which they have not been signed.

Let's use the `wash` CLI to inspect the set of capabilities this actor has:

```shell
wash claims inspect wasmcloud.azurecr.io/echo:0.3.4
```
```shell
                               Echo - Module
  Account       ACOJJN6WUP4ODD75XEBKKTCCUJJCY5ZKQ56XVKYK4BEJWGVAOOQHZMCW
  Module        MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5
  Expires                                                          never
  Can Be Used                                                immediately
  Version                                                      0.3.4 (4)
  Call Alias                                                   (Not set)
                               Capabilities
  HTTP Server
                                   Tags
  None
```

To start the HTTP server capability provider, again use the web UI and click **Start Provider** and then select _From Registry_. Supply the OCI URL `wasmcloud.azurecr.io/httpserver:0.16.2` and leave the _link name_ set to `default`. You should now see this capability provider running, and within 30 seconds it should report its status as Healthy.

![dashboard3](./washboard3.png)

Let's take a look at our host's inventory now. If you re-run the inventory command `wash ctl get inventory`, you should see something like the following (again, your Host ID will be different):

```shell
Host Inventory (NCPGH5CVPO3BAZ5OSQKXYHDKPBT3JXLG5EAOTG7XOXUWJ6AHZCFT57SI)

  hostcore.os                  linux
  hostcore.osfamily            unix
  hostcore.arch                x86_64

  Actor ID                                                    Name               Image Reference
  MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5    N/A                wasmcloud.azurecr.io/echo:0.3.4

  Provider ID                                                 Name               Link Name          Image Reference
  VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M    N/A                default            wasmcloud.azurecr.io/httpserver:0.16.2
```

#### Linking actors and capability providers

The Echo actor and HTTP Server providers are running, but they aren't connected. Since the HTTP server provider hasn't been _linked_ to any actor yet, it hasn't yet opened a port to listen to web requests to forward to the actor. To allow the actor and provider to communicate, they need to be linked. We could link them with wash cli (`wash ctl link put ...`), using the Actor ID and the Provider ID from the inventory, but this time we'll link them in the web UI.

Go back to the web UI and click **Define Link**. The web UI remembered the public keys of the actors and providers running, so you just need to pick them out of a dropdown selector at the top of the form, as shown below. Leave the _Link Name_ as default, and set the _Contract ID_ to `wasmcloud:httpserver`. For the _Values_ field, you'll need to provide either a port to listen on or an address including hostname and port. For simplicity and compatibility, enter the following into your _Values_ form:
```shell
address=0.0.0.0:8080
```

![dashboard4](./washboard4.png)

Once you see that the link has been added to the dashboard UI (you can also use `wash` to query this from the lattice), you are ready to send a request to your actor.

#### Interacting with your actor

In another terminal window, run the following command:

```shell
curl localhost:8080/echo
```

In response, you should receive your request object (notice the path argument):

```shell
{"body":[],"method":"GET","path":"/echo","query_string":""}
```

Feel free to try out different methods of making a request to your actor, including adding headers or using a different HTTP method to see different outputs.

Instead of using `curl`, you can also _directly invoke_ actors' registered functions using `wash call`. The function that "echoes" this HTTP request is a part of the interface `wasmcloud:httpserver` and has the operation name `HandleRequest`. We can make this request directly to the actor if we supply the correct parameters. Because this is mimicking the invocation made by a real host, you'll also need to use a cluster seed that's a valid issuer of invocations. For our purposes, we can use the one used to launch the host, but keep in mind this is a secret key and should not be shared.

**As of `wash` `v0.7.0` and wasmCloud `v0.50.2`, this cluster seed is inferred automatically with the use of [contexts](../../reference/wash/contexts). You can skip ahead to [using call](#using-call)**.

To find your cluster seed, take a look at the logs and look for a 56 character ID that starts with **SC**. You can find the logs either in your terminal where you ran the wasmCloud host, or relative to where you unpacked the application tarball in the file `tmp/log/erlang.log.1`

Look for something like:

```shell
08:36:10.814 [info] Host NBIF7UHMVSLGXHVCD7KL6NS4RC5PH7CERDL4MF7UR3D4QNJ524UUWN4F started.
08:36:10.814 [info] Valid cluster signers CDLND22ZY7ZID5XEIXMLRWLUXL5NOI6DGECSAXAHT4GONMXWRARTR6M7
08:36:10.814 [warn] ** WARNING. You are using an ad hoc generated cluster seed.
08:36:10.814 [warn]    For any other host or CLI tool to communicate with this host, you MUST copy the following seed key and
08:36:10.814 [warn]    use it as the value of the WASMCLOUD_CLUSTER_SEED environment variable:
08:36:10.814 [warn]    SCAJIRZPJGI2ODWHALXJ5U7ZRC7MR27JMJOPLIKMDJ3QNQGA3TCPDFENDI
```

Once you locate the value, go ahead and export it as an environment variable:


{{% tabs %}}
{{% tab "Unix" %}}

```shell
export WASMCLOUD_CLUSTER_SEED=SCAJIRZPJGI2ODWHALXJ5U7ZRC7MR27JMJOPLIKMDJ3QNQGA3TCPDFENDI
```

{{% /tab %}}
{{% tab "Windows Powershell" %}}

```powershell
$env:WASMCLOUD_CLUSTER_SEED = SCAJIRZPJGI2ODWHALXJ5U7ZRC7MR27JMJOPLIKMDJ3QNQGA3TCPDFENDI
```

{{% /tab %}}
{{% /tabs %}}

`wash` will automatically use this cluster seed. Alternatively, you can always supply it as a command line flag `--cluster-seed` to the `call` operation. 

#### Using call

Here's an example of using `wash call` to mimic the previous `curl` command. Note that this is not interacting with the `HTTP Server` provider, and we don't need it to be running or linked for this operation to succeed:

```shell
wash call MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5 HttpServer.HandleRequest '{"method": "GET", "path": "/echo", "body": "", "queryString":"","header":{}}'
```

⚠️ `call` only works here because the parameters in the JSON payload are _exactly_ the same in terms of fields, shape, and data types as the payload that the actor is expecting. If a field is missing, or a data type is incorrect, the actor will reject the call.

Our output looks like this:

```shell
Call response (raw): ��statusCode�Ȧstatus�OK�header��body�H{"method":"GET","path":"/echo","query_string":"","headers":{},"body":[]}
```

Because the actor isn't actually returning JSON, the return payload has some characters that the terminal doesn't know how to interpret from its bytes[^1]. However, you can still see the response body which contains our exact "echoed" request. Note that there's a more "human" friendly way of invoking actors using the dashboard's web UI.

Congratulations! You've made it through the first guide to wasmCloud. You should now feel comfortable exploring the ecosystem, starting and stopping the host runtime, interacting with the wasmCloud dashboard web UI, and interacting with lattices using the `wash` command line tool.

To learn more about actors, providers, and more about wasmCloud, continue on to the [App Development](../../app-dev) or [Platform Building](../../platform-builder) sections depending on your interests.

[^1]: We're using [msgpack](https://msgpack.org/) to serialize arbitrary data payloads when sending information to and from actors. Due to this serialization format, the bytes sent to and from actors must be deserialized with the shape of the object already known, and in the case of `wash call` we are doing our best guess as to what the return payload is going to look like. As you can see when using `curl`, when we know the shape of the data (an HTTP response) we're able to fully deserialize the actor's response.
