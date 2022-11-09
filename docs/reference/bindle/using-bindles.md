---
title: "Using Bindle with wasmCloud"
date: 2021-12-29T11:02:05+06:00
weight: 2
draft: false
---

[Bindles](https://github.com/deislabs/bindle) can be used with both `wash` and the wasmCloud
Dashboard. To use a bindle instead of an OCI image, simply preface the bindle ID with `bindle://`
and the host will attempt to download the provider or actor using Bindle.

For example:

```console
$ wash ctl start provider bindle://wasmcloud.dev/httpserver/0.14.7
```

## Configuring Bindle

Unlike OCI images, Bindle IDs do not contain their hosting server (i.e. `wasmcloud.azurecr.io`).
Currently you can only configure 1 bindle server for a host. To configure the host to use a specific
bindle server, the following environment variables are available when starting a wasmCloud host:

| Variable           | Description                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BINDLE_URL`       | The base URL of the Bindle server to connect to. Please note that this must be a full URL with the base path (e.g. `https://my.bindle.com/v1`, most Bindle servers mount the API at a particular version path). Defaults to `http://localhost:8080/v1` |
| `BINDLE_TOKEN`     | A static token (generally for a service account) to use for authentication. If this is set it will take precedence over HTTP basic auth                                                                                                                |
| `BINDLE_USER_NAME` | The username to use for HTTP basic auth. If this is set, then `BINDLE_PASSWORD` must be set as well                                                                                                                                                    |
| `BINDLE_PASSWORD`  | The password to use for HTTP basic auth. This will be ignored if `BINDLE_USER_NAME` is not set                                                                                                                                                         |
