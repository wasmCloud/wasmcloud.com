---
title: 'OTP Host Configuration'
date: 2022-07-29
sidebar_position: 3
draft: false
---

<head>
  <meta name="robots" content="noindex" />
</head>

:::warning
wasmCloud's [Elixir host runtime](https://github.com/wasmcloud/wasmcloud-otp) has been deprecated. The [Rust wasmCloud runtime](https://github.com/wasmCloud/wasmCloud) is receiving all new features
:::

The wasmcloud host is configured by environment variables, which can be set in the environment or `.env` files.
Real environment variables take precedence over values found in `.env` files.
Some of the values contain secrets and should be protected accordingly.

The following sources of environment variables will be considered:

- `.env`
- `.env.local`
- `.env.[dev|test|prod]`
- `.env.[dev|test|prod].local`

As mentioned, any environment variable supplied at runtime will override variables supplied in any `.env` file. Best practice suggests that developers use the `.local` files to represent their local workstation environments and to not check those files into source control.

Environment variables and `.env` files are combined to create a **host configuration** file in the same directory that started the host. The generated `host_config.json` file contains all of the values that were used to launch the most recent host and can be edited and used directly instead of specifying your configuration values each time. This also means that launching subsequent hosts on your machine will automatically connect to the same lattice as your previously launched host.
(To edit the file, open in a json-aware editor such as VS Code, or you can use `jq` to pretty-format it and edit with any text editor.)

### Supported configuration variables

These variables can be set in your shell environment to configure a host. After your first time launching a host, these variables are also available for modification in `host_config.json` as mentioned above, mostly under the same name without the `WASMCLOUD_` prefix.

| _Environment variable name_                                                                    | _Description_                                                                                                                                                                                                                                                                                                                                                                                |
| :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WASMCLOUD_LATTICE_PREFIX`                                                                     | A unique identifier for a lattice, and is frequently used within NATS topics to isolate messages from different lattices. If not specified, the lattice is "default". See [Character sets](../../lattice-protocols/name/#character-sets) for the characters that may be used in lattice names.                                                                                               |
| `WASMCLOUD_RPC_HOST`<br/>`WASMCLOUD_RPC_PORT`<br/>`WASMCLOUD_RPC_SEED`<br/>`WASMCLOUD_RPC_JWT` | Configuration for the NATS client connection used for incoming RPC messages to the host. `HOST` is an ip address or dns name, with default `127.0.0.1`. `PORT` is the port number with default `4222`. `SEED` and `JWT` are used for authenticated connections and can be obtained from the `.creds` file generated with `nsc generate creds`.                                               |
| `WASMCLOUD_RPC_TIMEOUT_MS`                                                                     | Timeout in milliseconds for all RPC calls. The default value is 2000 ms (2 seconds). (Due to a [current limitation](https://github.com/wasmCloud/wasmcloud-otp/issues/397), the maximum value of this timeout is effectively 5000).                                                                                                                                                          |
| `WASMCLOUD_CTL_HOST`<br/>`WASMCLOUD_CTL_PORT`<br/>`WASMCLOUD_CTL_SEED`<br/>`WASMCLOUD_CTL_JWT` | Configuration for the NATS client connection used for lattice control messages sent by `wash` and `wadm`. `HOST` is an ip address or dns name, with default `127.0.0.1`. `PORT` is the port number with default `4222`. `SEED` and `JWT` are used for authenticated connections and can be obtained from the `.creds` file generated with `nsc generate creds`.                              |
| `WASMCLOUD_CLUSTER_SEED`                                                                       | The seed key (a printable 256-bit Ed25519 private key) used by this host to sign all invocations. wasmcloud RPC messages are cryptographically signed for authenticity and integrity. Note that different hosts can use different seed keys as long as their corresponding public keys are in the list of `WASMCLOUD_CLUSTER_ISSUERS`. The cluster seed is generated by the host on startup. |
| `WASMCLOUD_CLUSTER_ISSUERS`                                                                    | A comma-delimited list of public keys that can be used as issuers on signed invocations. If there are multiple hosts in the lattice, the cluster keys of all the other lattice hosts must be included in this list. The host's own cluster key is automatically added to this list.                                                                                                          |
| `WASMCLOUD_JS_DOMAIN`                                                                          | Jetstream domain name, configures a host to properly connect to a NATS supercluster.. Default is "" (empty)                                                                                                                                                                                                                                                                                  |
| `WASMCLOUD_PROV_SHUTDOWN_DELAY_MS`                                                             | Delay, in milliseconds, between requesting a provider shut down and forcibly terminating its process. Default: 300.                                                                                                                                                                                                                                                                          |
| `WASMCLOUD_OCI_ALLOW_LATEST`                                                                   | Determines whether OCI images tagged `latest` are allowed to be pulled from OCI registries and started. For increased security, the default value is `false` because `latest` is a possible attack and instability vector.                                                                                                                                                                   |
| `WASMCLOUD_OCI_ALLOWED_INSECURE`                                                               | A comma-separated list of OCI hosts to which insecure (non-TLS) connections are allowed. By default, no insecure connections are allowed (""). For local development with a docker registry, this is commonly set to `"127.0.0.1:5000"`                                                                                                                                                      |
| `WASMCLOUD_ALLOW_FILE_LOAD`                                                                    | A boolean value that determines if the host is allowed to start custom actors or providers from local files. Default value is `false`.                                                                                                                                                                                                                                                       |
| `WASMCLOUD_STRUCTURED_LOGGING_ENABLED` <br/><br/> `WASMCLOUD_STRUCTURED_LOG_LEVEL`             | Enable JSON structured logging from the wasmcloud host. (default `false`). <br/>If enabled, the `LOG_LEVEL` controls the verbosity of these logs. Choose from `error`, `warn`, `info`, or `debug`. Defaults level is `info`.                                                                                                                                                                 |
| `OCI_REGISTRY` <br/> `OCI_REGISTRY_USER` <br/> `OCI_REGISTRY_PASSWORD`                         | Specifies a URL, and user/passord authentication for an OCI registry. Defaults are "" (none).                                                                                                                                                                                                                                                                                                |

### Character sets

A **lattice** name is composed of one or more of the following characters: `A-Za-z_-` (upper- and lower- case ascii letters, digits, dash, and underscore). Spaces, periods, non-ascii characters, and non-printable ascii characters are specifically not allowed.
We recommended that lattice names be limited to the characters listed above for maximum compatibility with future wasmcloud protocols.
