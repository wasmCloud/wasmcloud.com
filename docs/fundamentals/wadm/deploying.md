---
title: "Deploying Wadm"
date: 2020-01-19T00:00:00+00:00
icon: "ti-map" # themify icon pack : https://themify.me/themify-icons
description: "Deploying and Running the Wadm Application"
type: "docs"
sidebar_position: 1
---

This guide will walk you through the steps to deploy the [wadm](https://github.com/wasmcloud/wadm)
application in a lattice. We will cover how to deploy wadm from binaries or Docker, and how to
configure NATS credentials for controlling access to wadm

## Installing Wadm

We offer wadm as a standalone binary or as a docker image.

### Standalone Binary

You can download the latest release of wadm from the [releases
page](https://github.com/wasmCloud/wadm/releases/latest). We have the following binaries available:

- Linux (x86_64)
- Linux (aarch64)
- MacOS (x86_64)
- MacOS (aarch64)
- Windows

In the future we will likely offer easier ways to install wadm (such as apt, homebrew, chocolatey,
etc), but for now you'll have download the binary.

Once you have downloaded the tarball appropriate for your system, you can extract it and move the
`wadm` binary into your path (e.g. `mv wadm /usr/local/bin/wadm`).

:::note
In the future we hope to add some examples of a systemd unit for running this on a server and
terraform for deploying this to a cloud provider.
:::

### Docker

You can find a list of all available wadm images on [GitHub
packages](https://github.com/wasmCloud/wadm/pkgs/container/wadm). In addition to tagged versions, we
also have two additional tags:

- `latest` - The latest tagged release of wadm
- `canary` - The latest build of wadm from the `main` branch

## Deployment architectures

Wadm can be deployed in a variety of ways depending on your needs. It does not require wasmCloud to
run, but runs alongside it. You can run as many wadm instances as you need to achieve HA guarantees.
Wadm requires no additional configuration to run more than one instance or to add more instances, it
will simply join in and start handling incoming events. Nor do you need to even run them in the same
data center or location. All that is required is the ability to connect to and authenticate with the
same NATS cluster used for your lattice. For a production deployment we recommend at least 3
instances of wadm.

### Single lattice management

The simplest of all deployment patterns is to run a group of wadm instances per lattice. Credentials
for this only need to be able to receive messages from a single lattice and will only ever manage
one lattice. If you are just starting out with wasmCloud, this is most likely the deployment pattern
you will want to use. See [Configuring NATS Credentials](#configuring-nats-credentials) for more
information on how to configure NATS credentials.

### Multi-lattice management

This pattern is slightly more complex than the single lattice management pattern. In this pattern,
you are managing multiple lattices all running on the same NATS cluster (e.g. such as for your team
or group), meaning wadm will be looking for all events on `wasmbus.evt.*`. This is useful if you
have multiple lattices running in different environments (e.g. dev, staging, production) and want to
manage them all from a single wadm instance. This pattern requires that you configure NATS
credentials to be able to receive messages from all lattices. See [Configuring NATS
Credentials](#configuring-nats-credentials) for more information on how to configure NATS
credentials. 

However, it is important to note that the difference between this pattern and the single lattice
management pattern is purely in the credentials used (you still can run the instances in the same
way). The wadm instances themselves are identical. This means that you can start with a single
lattice management pattern and then move to a multi-lattice management pattern by simply changing
the credentials used by wadm.

### Multi-tenant management

The most complex case is when you want to manage multiple lattices running on different NATS
clusters. This is useful if you are running wasmCloud for various groups/teams across an
organization and want to manage multiple lattices running on clusters with segmented traffic. This
pattern requires that you configure NATS credentials to be able to receive messages from all
lattices. 

:::warning
Currently, this pattern is not supported. We are working on adding support for this in the 0.5
release with detailed instructions on how it could be configured.
:::

## Configuring NATS Credentials

Wadm uses NATS for communication with the lattice. This means that you will need to configure NATS
credentials for wadm to use and for users to authenticate with. Like wasmCloud hosts, wadm expects
to use decentralized JWT authentication or anonymous authentication. This is a very complex topic
that will not be covered in full here, but you can get a full walkthrough in the [NATS
documentation](https://docs.nats.io/running-a-nats-service/nats_admin/security/jwt). In this section
we will cover what topics wadm needs access to in order to function.

TODO: I need some help here enumerating how to restrict credentials down for people

### Wadm credentials

Wadm will essentially need a set of "root" credentials to your lattice, no matter which deployment
pattern you choose. Those topics differ depending on the pattern you choose and are detailed in the
sections below

#### Single lattice management

Wadm will need a set of credentials that can publish and receive on the following topics:

**Publish**

- `wadm.evt.<lattice-id>`
- `wadm.cmd.<lattice-id>`
- `wadm.notify.<lattice-id>`
- `wasmbus.ctl.<lattice-id>.>`
- `$JS.API.STREAM.>`
- `$JS.*.API.STREAM.>`
- `$JS.API.STREAM.UPDATE.>`
- `$JS.*.API.STREAM.CREATE.>`


#### Multi-lattice management

Wadm will need a set of credentials that can publish and receive on the following topics:

**Publish**

- `wadm.evt.*`
- `wadm.cmd.*`
- `wadm.notify.*`
- `wasmbus.ctl.>`

### User credentials

#### Multi-tenant

:::warning
Currently, this pattern is not supported. We are working on adding support for this in the 0.5
release with detailed instructions on how it could be configured.
:::

## Configuring Wadm

Wadm is configured via environment variables or command line flags. The following configuration
values are supported:

| Option                       | Environment Variable        | Description                                                                                                                                                               | Default Value                      |
| ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `-l`, `--structured-logging` | `WADM_STRUCTURED_LOGGING`   | Whether or not to use structured log output (as JSON)                                                                                                                     | `false`                            |
| `-t`, `--tracing`            | `WADM_TRACING_ENABLED`      | Whether or not to enable opentelemetry tracing                                                                                                                            | `false`                            |
| `-e`, `--tracing-endpoint`   | `WADM_TRACING_ENDPOINT`     | The endpoint to use for tracing. Setting this flag enables tracing, even if `--tracing` is set to false.                                                                  | `http://localhost:55681/v1/traces` |
| `-d`                         | `WADM_JETSTREAM_DOMAIN`     | The NATS JetStream domain to connect to                                                                                                                                   | `None`                             |
| `-s`, `--nats-server`        | `WADM_NATS_SERVER`          | The URL of the nats server you want to connect to                                                                                                                         | `127.0.0.1:4222`                   |
| `--nats-seed`                | `WADM_NATS_NKEY`            | Use the specified nkey file or seed literal for authentication. Must be used in conjunction with `--nats-jwt`                                                             | `None`                             |
| `--nats-jwt`                 | `WADM_NATS_JWT`             | Use the specified jwt file or literal for authentication. Must be used in conjunction with `--nats-seed`                                                                  | `None`                             |
| `--nats-creds-file`          | `WADM_NATS_CREDS_FILE`      | (Optional) NATS credential file to use when authenticating                                                                                                                | `None`                             |
| `--state-bucket-name`        | `WADM_STATE_BUCKET_NAME`    | Name of the bucket used for storage of lattice state                                                                                                                      | `wadm_state`                       |
| `--manifest-bucket-name`     | `WADM_MANIFEST_BUCKET_NAME` | Name of the bucket used for storage of manifests                                                                                                                          | `wadm_manifests`                   |
| `--cleanup-interval`         | `WADM_CLEANUP_INTERVAL`     | The amount of time in seconds to give for hosts to fail to heartbeat and be removed from the store. By default, this is 120s because it is 4x the host heartbeat interval | `120`                              |
| `-j`, `--max-jobs`           | `WADM_MAX_JOBS`             | (Advanced) Tweak the maximum number of jobs to run for handling events and commands. Be careful how you use this as it can affect performance                             | `256`                              |
| `-i`, `--host-id`            | `WADM_HOST_ID`              | The ID for this wadm process. This is used to help with debugging when identifying which process is doing the work                                                        | Random UUIDv4                      |
| `--api-prefix`               | `WADM_API_PREFIX`           | The API topic prefix to use. This is an advanced setting that should only be used if you know what you are doing                                                          | `wadm`                             |

### Connecting to NATS

Once you have configured your NATS credentials, you can configure wadm to use them with a variety of
options. If you are connecting to a non-local endpoint, you'll need to set `-s`/`--nats-server` to
the address of that NATS endpoint (e.g. `nats.example.com:4222`). With credentials configured, the
most likely option you'll need to set is `--nats-creds-file` to the path to the credentials file
created earlier. For other use cases (such as loading your seed and JWT from something like Vault),
you can use the `--nats-seed` and `--nats-jwt` flags to specify the seed and JWT directly.

:::note
If `--nats-creds-file` is set, `--nats-seed` and `--nats-jwt` cannot be used
:::

By default, if no NATS credentials are provided, wadm will just use anonymous localhost connections.
This is fine for development, but for production you will want to configure NATS credentials either
on a [leaf node](https://docs.nats.io/running-a-nats-service/configuration/leafnodes) (which then
uses a localhost connection) or by connecting to a NATS cluster by setting the `--nats-server` flag. 

As a final note, [NATS](https://docs.nats.io/running-a-nats-service/configuration/clustering)
[architectures](https://natsbyexample.com/) are varied so we cannot provide a one-size-fits-all
solution for how exactly you will connect, but the above instructions about configuring NATS
credentials and using them when running wadm should be enough to get you started.

### Preconfiguring storage

For production deployments, we highly recommend preconfiguring the storage buckets for wadm. This
includes one bucket for state storage and one bucket for manifest storage. These buckets should be
configured to have multiple replicas so that it is highly available and durable. In particular, the
manifest bucket should be backed up regularly as it contains all of the manifests. In a worst case
scenario losing your state means a 1-2 minute delay while wadm waits for all hosts to report in via
events, but losing your manifests means they're gone.

An example of how these buckets could be configured is below:

```bash
nats kv add wadm_manifests --history=1 --replicas=3 --storage=file
```

You can name the bucket whatever you'd like, but if you name it other than the default you will need
to set the `--manifest-bucket-name` or `--state-bucket-name` flag to the name of the bucket you
created.
