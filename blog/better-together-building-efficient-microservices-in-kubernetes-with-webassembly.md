---
title: 'Better Together: Building Efficient Microservices in Kubernetes using WebAssembly'
image: 'images/blogs/adobe-kubernetes/header.png'
date: 2022-11-17T11:00:00-05:00
author: 'Sean Isom and Colin Murphy, Adobe'
description: 'Bringing two major CNCF projects together – wasmCloud and Kubernetes – promises greater agility and major efficiencies'
categories: ['webassembly', 'wasmcloud', 'kubernetes', 'Cloud Native', 'CNCF']
draft: false
---

# Adobe and Kubernetes

![algebra](/images/blogs/adobe-kubernetes/header.png)

Born out of pizza-fueled build nights, Adobe’s Ethos project emerged from a desire to find better ways to ship cloud software. Focusing around containers, we first worked to port an exact replica of the developer's local environment in the cloud. Next we created a standardized environment in which to run our software – a basic clusterization model. By building a centralized infrastructure platform, we could solve some developer pain and create economies of scale in efficiency, security, and operations. Fast forward eight years, and Adobe’s Ethos platform runs more than 90% of Adobe's containers on Kubernetes, powering diverse applications across many different business units.

<!--truncate-->

Having multi-tenant clusters has loads of operational benefits (flexibility, security), but efficiently managing resources for arbitrary workloads with different scaling and provisioning characteristics is challenging. A common assumption with containers is that they automatically enable one to run efficiently in the cloud. However, containers still have to map to a fixed size virtual machine - fine if we’re dealing with small, agile distributed systems that can perfectly bin-pack. But, when mixed with larger, more monolithic systems, overall efficiency can drop.

What if there was a more lightweight model that could be almost instantly scaled as traffic scales up, giving more scheduling flexibility than a coarse-grained container? I’m reminded of the quote from Docker creator, Solomon Hykes:

:::note[Quote]
“If WASM+WASI existed in 2008, we wouldn't have needed to have created Docker. That's how important it is. WebAssembly on the server is the future of computing.”
:::

For the past 5 years Adobe has invested heavily in Wasm to bring native codebases to first-class apps in a web browser. With much work in the cloud native community having been done to bring Wasm to more ‘beyond the browser’ use cases, we began experimenting to see if some of these benefits could be achieved directly in Kubernetes.

# Taking Wasm from the Browser to the Backend

Even before Wasm, Adobe was a pioneer of bringing desktop applications to the web, utilizing technologies such as Web Workers, PNaCl, and even transpiling C++ to JavaScript to be able to reuse native codebases in the browser. As Wasm has standardized with features such as threads, and developer tooling for Wasm has improved, we have continued this journey to the web, culminating in our new web-based Photoshop experience. Wasm allows us to keep the same core C++ code base - compiled to the desktop, mobile and browser.

Simultaneously, we have successfully optimized the use of web services for nearly a decade through improving client application utilization, optimizing autoscaling and bin-packing, and minimizing waste. We have been focusing these efforts on Kubernetes for over three years in our latest iteration of this platform, after DC/OS and raw Mesos. Our focus on making containers more efficient forms the groundwork of the natural next phase in our evolution - seeing if other architectures other than containers can run high-availability, high-scale cloud services.

Why? There’s a recognition that the architecture is changing. As server-side WebAssembly technologies have matured, we’ve grown curious to see how Wasm might be able to live alongside containerized services in Kubernetes to see efficiency and performance benefits without abandoning our existing investments.

We’ve embarked upon a couple of early projects designed to reveal the potential efficiencies of running Kubernetes together with the open-source wasmCloud platform for distributed applications by Cosmonic.

# Use Case 1: Running Individual Functions in wasmCloud

We began collaborating on taking an existing function that removes the background from images, translating it into Rust and porting it to wasmCloud. Colin gave a really compelling demo, where you can see a) the original version, and b) compiled to Wasm and running as a wasmCloud Actor.

![signature removal setup](/images/blogs/adobe-kubernetes/sigremoval-one.png)

![signature removal result](/images/blogs/adobe-kubernetes/sigremoval-two.png)

Here, we can spin up an actor instantaneously to service the request, with an extremely low memory footprint versus running a service that needs a level of always-on, baseline resources. Functions can easily be spun off to work on-device or in the cloud. This enables extremely efficient use of cloud resources while promoting code and module reuse across a variety of compute architectures.

This early working model has attracted interest amongst other teams. The focus has now shifted to finding ways to run more complex systems in the same way, in production.

# Use Case 2: Running wasmCloud as a Service in Kubernetes Clusters

Having seen some success in porting individual functions to run as actors wasmCloud, we then wanted to see if we could take a full microservice, currently running in Kubernetes, and make it run in Wasm. Can we still see the greater efficiency and performance of Wasm without fundamentally changing the architecture of the service or our cloud platform?

We found the most direct path was to run wasmCloud directly in one of our Kubernetes clusters with an existing Rust service. We can strip out native dependencies as capability providers, and reuse the Rust code in a wasm32-unknown-unknown build target. That makes porting to wasmCloud very easy. Then we simply need to install wasmCloud within Kubernetes:

Step-by-Step
Ensure you have Helm installed, and valid credentials for a Kubernetes cluster. For us, that entails [configuring kubectl to use an authenticated kubeconfig.yaml](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/). Also, for this example we will configure kubectl to install the helm chart for wasmCloud [directly into the namespace of our target application](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/#setting-the-namespace-preference).

Normally, you can follow the single step in the documentation for installing wasmCloud via Helm. However, we want to slightly customize this to enable the Kubernetes Applier to bootstrap application deployment. First, create a custom values.yaml:

```yaml
wasmcloud:
  enableApplierSupport: true
  customLabels:
    wasmcloud.dev/route-to: 'true'
```

Then you can deploy via helm (with your choice of RELEASE_NAME)

```bash
helm install <RELEASE_NAME> wasmcloud/wasmcloud-host -f values.yaml
```

Finally, to verify the install, you can grab the name of the deployment:

```bash
$ kubectl get deployments
NAME                            READY   UP-TO-DATE   AVAILABLE   AGE
wasmcloud-test-wasmcloud-host   1/1     1            1           4m32s
```

And then forward port 4000 to localhost:

```bash
$ kubectl port-forward deployment/wasmcloud-test-wasmcloud-host 4000
Forwarding from 127.0.0.1:4000 -> 4000
Forwarding from [::1]:4000 -> 4000
Handling connection for 4000
```

Then finally simply visit [localhost:4000](http://localhost:4000) in your favorite browser, and you can see the wasmCloud dashboard ready to run your first apps, all from an existing Kubernetes namespace.

Right now, this is simple bootstrapped infrastructure. It runs wasmCloud hosts within the service’s namespace in Kubernetes side-by-side with the existing service. Long-term it would be more efficient to have a pool of wasmCloud hosts in the cluster to support any number of client applications.

We’re also using a handy wasmCloud Actor written by Taylor Thomas at Cosmonic, the wasmCloud Kubernetes Applier, to easily deploy other actors to the wasmCloud infrastructure inside Kubernetes we just provisioned. Check it out…

[The applier is hosted here](https://github.com/cosmonic/kubernetes-applier/tree/main/service-applier), although you can use `wash` commands and don’t necessarily need to clone the repository just to use the applier.

Let’s set up the example `echo` actor to get things running. We’ll need to create several providers and actors, then wire them up with link definitions. First start the actors and providers [with the current latest versions](https://github.com/wasmCloud/capability-providers#first-party-capability-providers):

```bash
wash start provider wasmcloud.azurecr.io/applier:0.3.0
wash start provider wasmcloud.azurecr.io/nats_messaging:0.17.0
wash start provider wasmcloud.azurecr.io/httpserver:0.17.0
wash start actor wasmcloud.azurecr.io/service_applier:0.3.0
wash start actor wasmcloud.azurecr.io/echo:0.3.8
```

:::info
Previous guides used `wash ctl start`, which is now deprecated and will be removed in a future version.
See [the wash command refactoring RFC](https://github.com/wasmCloud/wash/issues/538) for more information and to provide feedback
:::

Next link the service applier actor to the NATS provider. You can do this via `wash` commands, but it can be easier to use the wasmCloud UI from your forwarded localhost:4000. Start with linking the service-applier to NATS, using the Contract ID (`wasmcloud:messaging`) and Values (`SUBSCRIPTION=wasmbus.evt.default,URI=nats://localhost:4222`) from the documentation:

![link definition messaging setup](/images/blogs/adobe-kubernetes/linkdef-one.png)

Next, connect the service-applier actor to the applier provider, using just the Contract ID (`cosmonic:kubernetes_applier`):

![link definition kubernetes applier setup](/images/blogs/adobe-kubernetes/linkdef-two.png)

Finally, link the Echo actor to the httpserver actor, using the Contract ID (`wasmcloud:httpserver`) and Values (`ADDRESS=0.0.0.0:8080`)

![link definition httpserver setup](/images/blogs/adobe-kubernetes/linkdef-three.png)

Note that this (and the previous commands) could also be done via wash:

```bash
$ wash ctl link put MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5 VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M wasmcloud:httpserver 'ADDRESS=0.0.0.0:8080'
⡃⠀ Defining link between MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5 and VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M ...
Published link (MBCFOPM6JW2APJLXJD3Z5O4CN7CPYJ2B4FTKLJUR5YR5MITIU7HD3WD5) <-> (VAG3QITQQ2ODAOWB5TTQSDJ53XK3SHBEIFNK4AYJ5RKAX2UNSCAPHA5M) successfully
```

This link will create a Kubernetes service automatically on port 8080:

```bash
$ kubectl get svc
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
mbcfopm6jw2apjlxjd3z5o4cn7cpyj2b4ftkljur5yr5mitiu7hd3wd5 ClusterIP 10.96.170.75 <none> 8080/TCP 10s
```

Finally, to test that it is all working, forward port 8080 from the new service, and you can hit localhost:8080 to see your wasmCloud actor in action!

```bash
$ kubectl port-forward svc/mbcfopm6jw2apjlxjd3z5o4cn7cpyj2b4ftkljur5yr5mitiu7hd3wd5 8080
Forwarding from 127.0.0.1:8080 -> 8080
Forwarding from [::1]:8080 -> 8080
Handling connection for 8080
…
$ curl localhost:8080
{"body":[],"method":"GET","path":"/","query_string":""}
```

We’re excited to share more soon. The entire service’s code is ported pending some dependencies that need to work in the Wasm environment. Now that wasmCloud has rolled out support for WASI, we should be able to clear the remaining blockers and get the service running end-to-end. The end goal would be to replace the entire service in production to see what kind of performance and efficiency improvements might emerge (and how that could scale to more services).

# In Summary

A major advantage of WebAssembly on the backend is that it can securely enable high performance and efficiency, while still being compatible with Kubernetes. So, in a case like ours, where we have huge investments in Kubernetes operations, compliance, and automation, we can integrate WebAssembly directly into our existing infrastructure. We can take advantage of new technologies today whilst understanding that the future may look completely different.

[_Originally posted on the Cloud Native Computing Foundation blog_](https://www.cncf.io/blog/2022/11/17/better-together-a-kubernetes-and-wasm-case-study/)
