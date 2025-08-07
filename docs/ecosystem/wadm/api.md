---
title: 'Using the wadm API'
date: 2020-01-19T00:00:00+00:00
icon: 'ti-map' # themify icon pack : https://themify.me/themify-icons
description: "Interacting with wadm's API"
type: 'docs'
sidebar_position: 4
---

:::warning[Planned changes to scheduling]
The [**wasmCloud Q3 2025 Roadmap**](https://github.com/orgs/wasmCloud/projects/7) sets out plans for an overhaul to scheduling in the next major release of wasmCloud. The new scheduling API will not use NATS to communicate between components by default, but will still support distributed communication via NATS. For more information, see the [Roadmap](https://github.com/orgs/wasmCloud/projects/7) and [Issue #4640: “Intentional distributed networking.”](https://github.com/wasmCloud/wasmCloud/issues/4640)
:::

The most common way to interact with a Wadm installation (which could be a single server or a
cluster) is through the [wash](/docs/ecosystem/wadm/usage/) command-line tool or the [Rust client
crate](https://docs.rs/wadm-client/latest/wadm_client/). However, if you are planning on creating
your own integration or writing a non-Rust language binding, then this reference will help.

Please note that in production deployments, you will likely be using separate NATS credentials for
accessing wadm. Please see the [operator guide](/docs/deployment/wadm/) for more information for running
wadm in production.

## Subject space

The Wadm API is exposed entirely as a NATS service on a NATS subject space. All of the API operations will
occur as _requests_ (_not_ simple publishes) on a subject in the following format:

```
wadm.api.{lattice-id}.{category}.{operation}.{object}
```

The `operation` is usually a verb, and `object` is an optional scope-limiter to the operation. In
many cases, the `object` will be something like a model name.

All requests and responses on this topic are encoded as JSON, except for the creation of models.

:::info
All model names are treated like unique identifiers and must conform to the rules
governing NATS subject segments. For example, they cannot contain spaces, commas, unprintable
characters, or periods.
:::

## Model persistence

In wasmCloud, models are versioned representations of application workloads stored in NATS key-value
buckets. The following operations pertain to storing and retrieving models. Persistence of models is
explicitly and deliberately separated from deployment management. Any model can have multiple
versions stored, and any one of those versions can be deployed. Model persistence is similarly
decoupled from any particular host.

### Store models

`wadm.api.{lattice}.model.put`

Model storage is _append-only_. New versions are added to the model's version history according to
retention policy and will not replace previously existing versions. This means that if you put a
model with the same version, it will be rejected. The `name` of the model is a unique identifier and
should be a valid NATS subject segment. Please note that specifying a version in a model is not
required. If a version is not specified, a [ULID](https://github.com/ulid/spec) will be generated
and used as the version.

#### Request

YAML or JSON serialization of OAM model. You can specify a `Content-Type` header in the
NATS request if you wish to hint to the server that you are sending JSON or YAML. If you do not
specify a `Content-Type` header, the server will attempt to parse the request as YAML first, then
JSON if that fails.

#### Response

```json
{
  "result": "error|created|newversion",
  "total_versions": 4,
  "current_version": "1.0",
  "message": "Successfully put manifest",
  "name": "foobar"
}
```

The response will indicate if storage failed, if a new model was created, or if a new version of a
model was pushed.

#### Additional information

_When_ a model version was added to the store is what determines what the current version is. Wadm
will not apply semantic meaning or assume the use of [semver](https://semver.org/) or otherwise
attempt to interpret the version field. We highly recommend using _semantic versioning_ for models,
but that is up to the developers. The string `latest` is explicitly NOT allowed as a version as it
used as a reserved word for indicating that the latest version should be deployed

Please note that versions are entirely optional. Wadm will by default generate a
[ULID](https://github.com/ulid/spec) for the model when it is pushed if no version is set. However,
versions must still be unique

### Get model list

`wadm.api.{lattice-id}.model.list`

Retrieves a list of models within the given lattice. The status of the model is an aggregate of the
statuses of the traits defined within. Only the newest version of the model is included in this
list.

#### Request

Empty body

#### Response

```json
[
    {
        "name": "foobar",
        "version": "v0.1.0",
        "description": "My cool model",
        "deployed_version": "v0.1.0",
        "status": "reconciling|deployed|failed|undeployed"
    },
    ...
]
```

The `version` field will always be set to the latest version stored (by time, as version is _not_
required to be semver). The `deployed_version` field will be set to the version
that is currently deployed. If no version is deployed, this field will be set to `null`. Please note
that `description` can also be `null` if no description was set

### Get a model spec

`wadm.api.{lattice}.model.get.{name}`

Retrieves the specification of the model stored with the given name. Caller must specify the version
of the model to be displayed. A list of stored versions can be obtained with the `versions`
operation.

#### Request

Empty body to fetch the latest version

or

```json
{
  "version": "1.0"
}
```

to fetch a specific version

#### Response

```json
{
  "result": "error|success|notfound",
  "message": "Successfully fetched model http-hello-world",
  "manifest": {
    "apiVersion": "core.oam.dev/v1beta1",
    "kind": "Application",
    "metadata": {
      "annotations": {
        "description": "HTTP hello world demo in Rust, using the WebAssembly Component Model and WebAssembly Interfaces Types (WIT)",
        "version": "v0.0.1"
      },
      "name": "http-hello-world"
    },
    "spec": {
      "components": [
        {
          "name": "http-component",
          "properties": {
            "image": "wasmcloud.azurecr.io/echo:0.3.7"
          },
          "traits": [
            {
              "properties": {
                "instances": 1
              },
              "type": "spreadscaler"
            }
          ],
          "type": "component"
        },
        {
          "name": "httpserver",
          "properties": {
            "image": "ghcr.io/wasmcloud/http-server:0.22.0"
          },
          "traits": [
            {
              "properties": {
                "interfaces": ["incoming-handler"],
                "namespace": "wasi",
                "package": "http",
                "source_config": [
                  {
                    "name": "default-http",
                    "properties": {
                      "address": "127.0.0.1:8080"
                    }
                  }
                ],
                "target": "http-component"
              },
              "type": "link"
            }
          ],
          "type": "capability"
        }
      ]
    }
  }
}
```

Note that the `manifest` field is the JSON serialization of the [OAM
model](https://github.com/wasmCloud/wadm/tree/main/oam)

### Version history

`wadm.api.{lattice}.model.versions.{name}`

Retrieves a list of all stored versions of a given model in order of creation.

#### Request

Empty body

#### Response

```json
[
  {
    "version": "...",
    "deployed": false
  },
  ...
]
```

Each of the items in the response list describes a revision and indicates whether that revision is
the deployed one. Remember that the ordering of the list does not reflect the semantic versioning as
we do not require that the version field be semver. If no manual versions were set, all IDs will be
also be lexicographically sortable to be the same as insertion order since they will be
[ULIDs](https://github.com/ulid/spec)

### Delete models

`wadm.api.{lattice}.model.del.{name}`

Deletes all versions of the named model. If the `version` field is set, then only that specific
version of this model will be deleted. If you delete a model version (or the whole model) that is
currently deployed, then the resources will be undeployed automatically as well.

#### Request

Empty body or

```json
{
  "version": "1.0"
}
```

#### Response

```json
{
  "result": "deleted|error|noop",
  "undeploy": true,
  "message": "Model version 1.0 deleted"
}
```

The response indicates success, failure, or noop (i.e. nothing was deleted because it didn't exist),
and if an `undeploy` operation occurred as part of the delete.

## Managing deployments

Deployments are discrete instances of autonomous control agents that monitor an application model
against the real-time, discovered state of a lattice. This agent monitors lattice events, compares
lattice state against the desired state of the model, and issues lattice control interface commands
in order to compensate for observed gaps.

### Deploy

`wadm.api.{lattice}.model.deploy.{name}`

Deploys the indicated model. This operation is idempotent, and will simply "succeed" if a request to
deploy an already deployed model is received. The previous version, if deployed, does not need to be
_undeployed_. Instead, the desired state of the new version is compared against the observed state
of the lattice and the autonomous agents will compensate accordingly. If the request payload is
empty, or the `version` field contains the keyword `latest`, the newest model spec stored will be
deployed.

#### Request

Empty body to deploy the latest version

or

```json
{
  "version": "version to deploy"
}
```

**Response**:

```json
{
  "result": "acknowledged|error|notfound",
  "message": "..."
}
```

It's important to note that the success/fail of this call doesn't indicate completed deployment,
only success or failure of the receipt of the deployment request. In other words, the response is an
_ack_. `notfound` is a specific error condition that indicates the model or version was not found

### Undeploy

`wadm.api.{lattice}.model.undeploy.{name}`

Undeploys the currently deployed version of a model, destroying all resources managed by this model.
If the model is already undeployed, the operation is idempotent and will return success along with
an appropriate message.

:::note
The response is delivered immediately as an acknowledgement, as it can take several minutes
to complete an undeploy.
:::

#### Request

Empty body

**Response**:

```json
{
  "result": "acknowledged|error|notfound",
  "message": "Undeployed model"
}
```

It's important to note that the success/fail of this call doesn't indicate completed deployment,
only success or failure of the receipt of the deployment request. In other words, the response is an
_ack_. `notfound` is a specific error condition that indicates the model or version was not found

### Deployment status

:::warning
This functionality is not yet implemented. The documentation below is what we plan on implementing
for the status api
:::

`wadm.api.{lattice}.model.status.{name}`

Describes the deployment status of a given model. Note that since only one version of a model is
ever deployed at one time, we don't need to specify a version here. The currently deployed version
is included in the response.

The response includes a `status` field which is an aggregate at high levels and an individual status
for single traits.

#### Request

Empty body

#### Response

```json
{
  "version": "...",
  "status": {
    "type": "undeployed|reconciling|deployed|failed",
    "message": "..."
  },
  "components": [
    {
      "name": "...",
      "type": "...",
      "status": {
        "type": "...",
        "message": "..."
      },
      "traits": [
        {
          "name": "...",
          "type": "spreadscaler|linkdef",
          "status": {
            "type": "...",
            "message": "..."
          }
        }
      ]
    }
  ]
}
```
