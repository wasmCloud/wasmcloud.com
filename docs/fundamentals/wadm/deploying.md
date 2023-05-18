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
credentials to be able to receive messages from all lattices. The credentials you generate below
in [Configuring NATS Credentials](#configuring-nats-credentials) are set up to follow this pattern.

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

### Wadm credentials

Wadm will essentially need a set of "root" credentials to your lattice, no matter which deployment
pattern you choose. Those topics differ depending on the pattern you choose and are detailed in the
sections below.

The easiest configuration for users is to use anonymous authentication. This is the default
configuration for NATS leaf nodes started by `wash up`. In this mode anyone with access to NATS can
make requests of the Wadm API, and Wadm can make any requests it needs of the [wasmCloud control
interface](../../hosts/lattice-protocols/control-interface). However, if you are deploying to
production, you will likely want to use JWT authentication, which is described below.
​
If you're not using anonymous authentication, the next easiest thing to do is to use JWT
authentication using a single configuration file with a [memory
resolver](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/jwt/mem_resolver).
If you follow this tutorial and change user permissions based on the topics below, you'll be able to
create an environment that's secure for both Wadm and Wadm consumers. To perform these steps, you'll
need the NATS [nsc](https://docs.nats.io/using-nats/nats-tools/nsc) command line tool installed. The
following set of steps will create a simple environment with two users: one for `wadm` and one for
wadm consumers like `wash`. 
​
<details>
<summary>Creating a Sample Account and Users</summary>

```
nsc add operator -n wadmdemo
nsc add account --name WADM
nsc add user --name wadmconsumer
```

Take note of where the user's credentials were created. They aren't part of the server configuration
so you'll need them later.

```
[ OK ] generated user creds file `~/.local/share/nats/nsc/keys/creds/wadmdemo/WADM/wadmapp.creds`
```

Continuing on:

```
nsc edit user --name wadmconsumer --allow-pub-response --allow-pub "wadm.api.>,wasmbus.ctl.>" 
nsc add user --name wadmapp
```

Again, keep track of where the credentials were created.

```
nsc edit user --name wadmapp --allow-pub-response --allow-sub "wadm.api.>" --allow-pub "wadm.>,wasmbus.ctl.>,$JS.>"
nsc generate config --mem-resolver --config-file ./server.conf
```

​Now you should have a configuration file that you can use via `nats-server -c server.conf`. This
will start NATS with the account you created. You also created a user that `wash` can use to consume
the wadm API, and you created a user that `wadm` can use to connect to NATS. The generated file will
look something like this: ​

```
// Operator "wadmdemo"
operator: eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiI2QU9ESE9BRDdHTUU0NEE1NFZTSVJXTUlVVzdVWFNUQURVMlBaVVRVVlFERklSQlFKQ1FRIiwiaWF0IjoxNjg0NDEzNDk1LCJpc3MiOiJPQ1BFU1dCRVlWVjNDSkFFUEs2QjdUS0xJQ1hMUzZRTDQ0VTRaNzQ3NFlSVFdMSVFFWE41U0dXMiIsIm5hbWUiOiJ3YWRtZGVtbyIsInN1YiI6Ik9DUEVTV0JFWVZWM0NKQUVQSzZCN1RLTElDWExTNlFMNDRVNFo3NDc0WVJUV0xJUUVYTjVTR1cyIiwibmF0cyI6eyJ0eXBlIjoib3BlcmF0b3IiLCJ2ZXJzaW9uIjoyfX0.eXv6L4qNC6qqsAXrVmxHiRkVIShCpiRrboPcOgC9MUqCosgAN4ybxFKDprCSCx8Y0V17eRUurNndgM4unOEDDQ
​
resolver: MEMORY
​
resolver_preload: {
  // Account "WADM"
  ACQ7XAJEVR6L3MVSGFBD7E5OMQY5Z2V3P35YZD4D6Z535O5FE4AMTCYH: eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJLUTdDQk9MU1NESllDTlJLNUZFNjJOS0VDUTVaM0FTNENTTklJNkZZT1BCNDIzT0JRNFVRIiwiaWF0IjoxNjg0NDEzNjA4LCJpc3MiOiJPQ1BFU1dCRVlWVjNDSkFFUEs2QjdUS0xJQ1hMUzZRTDQ0VTRaNzQ3NFlSVFdMSVFFWE41U0dXMiIsIm5hbWUiOiJXQURNIiwic3ViIjoiQUNRN1hBSkVWUjZMM01WU0dGQkQ3RTVPTVFZNVoyVjNQMzVZWkQ0RDZaNTM1TzVGRTRBTVRDWUgiLCJuYXRzIjp7ImxpbWl0cyI6eyJzdWJzIjotMSwiZGF0YSI6LTEsInBheWxvYWQiOi0xLCJpbXBvcnRzIjotMSwiZXhwb3J0cyI6LTEsIndpbGRjYXJkcyI6dHJ1ZSwiY29ubiI6LTEsImxlYWYiOi0xfSwiZGVmYXVsdF9wZXJtaXNzaW9ucyI6eyJwdWIiOnt9LCJzdWIiOnt9fSwidHlwZSI6ImFjY291bnQiLCJ2ZXJzaW9uIjoyfX0.EwPe-PxWvkBwvKpx4ddhI4qLWU649l6HqUGqIFjK0w6NIoXVTzxq8TCAUPLnNQnU9ItXa50X_uxDkdCljAsgCQ
​
}
```

If you find that the users you created aren't able to perform their required tasks, you can just
re-run `nsc edit user ....` to modify the credentials files (this doesn't require changing the
`server.conf` file!). ​
</details>

Lastly, when you get to production, you may want to secure your topic spaces using the [NATS
resolver](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/jwt/resolver),
which is a topic out of scope for this document.

:::note
The credentials generated above work for the multi-lattice management pattern. If you want to
restrict it to a single lattice, you can change the `allow` statements to use
`wasmbus.ctl.<lattice_id>.>` instead of `wasmbus.ctl.>` and `wadm.api.<lattice_id>.>` instead of
`wadm.api.>`. Please consult the NATS documentation for even more examples on how to restrict
credentials
:::

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
