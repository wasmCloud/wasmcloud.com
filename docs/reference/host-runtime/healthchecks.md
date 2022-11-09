---
title: "Health Checks"
date: 2021-08-18T11:02:05+06:00
weight: 11
draft: false
---

There are a number of different health check mechanisms available within the wasmCloud host. One health check type is internal, which will periodically send a health check message to an actor or capability provider to see if it is still responding. The second type involves exposing liveness and readiness probe endpoints that can be used when running in containerized or orchestrated (e.g. Kubernetes) environments.

#### Internal Health Checks
The wasmCloud host will send a `HealthRequest` message every 30 seconds to each running actor and capability provider. These requests are sent over the RPC channel, and are therefore subject to the RPC timeout. 

If your actor or provider was developed using one of our official SDKs, then it will automatically respond to the health request with "healthy" unless you override this behavior. If you're implementing your own actor SDK, then you will have to manually respond to the `HealthRequest` message.

If an actor or provider fails to respond within the appropriate time, or responds with a payload indicating a negative health status, the host will emit a `healthcheck_failed` event on the lattice event stream.

##### ℹ️ NOTE
The host does not currently take any corrective action for failed health checks. At this time, taking corrective action for health check failures should fall to higher level autonomous agents (such as the [lattice controller](https://github.com/wasmCloud/lattice-controller)) monitoring the lattice and not the host itself.

#### Liveness and Readiness Probes
The wasmCloud host also exposes HTTP endpoints that allow infrastructure to check to see if the host is _alive_ and if the host is _ready_. At present, both of these checks are identical--if the host's HTTP endpoints are up and running then it will report live/ready. This functionality will likely become more robust in the future based on developer feedback and as new features are added to the runtime.

On whatever port you've set your wasmCloud host to expose its HTTP endpoint, you can issue an HTTP `GET` request to `/readyz` and `/livez` respectively for readiness and liveness probes. Both will return `200/OK` if the host is ready/live.