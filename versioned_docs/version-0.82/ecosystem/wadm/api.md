---
title: 'Using the Wadm API'
date: 2020-01-19T00:00:00+00:00
icon: 'ti-map' # themify icon pack : https://themify.me/themify-icons
description: "Interacting with Wadm's API"
type: 'docs'
sidebar_position: 4
---

The normal way to interact with a `wadm` installation (which could be a single server or a cluster)
is through the [wash](./usage.md) command-line tool. However, if you are planning on
creating your own integration or writing a non-Rust language binding, then this reference will help.

:::warning
_wadm and its corresponding API are not currently 1.0_. This means the API is likely to
undergo changes and there may be some pieces that aren't yet implemented. This document will be
updated as we continue to work on the API. All API changes will also be communicated via the release
notes for wadm
:::

Please note that in production deployments, you will likely be using separate NATS credentials for
accessing wadm. Please see the [deployment guide](/docs/deployment/wadm/) for more information for running
wadm in production.

## Topic Space

The wadm API is exposed entirely as a NATS service on a topic space. All of the API operations will
occur as _requests_ (_not_ simple publishes) on a topic in the following format:

```
wadm.api.{lattice-id}.{category}.{operation}.{object}
```

The `operation` is usually a verb, and `object` is an optional scope-limiter to the operation. In
many cases, the `object` will be something like a model name.

All requests and responses on this topic are encoded as JSON, except for the creation of models.

:::info
**NOTE** that all model _names_ are treated like unique identifiers and must conform to the rules
governing NATS topic segments. For example, they cannot contain spaces, commas, unprintable
characters, or periods.
:::

## Model Persistence

The following operations pertain to storing and retrieving models. Persistence of models is
explicitly and deliberately separated from deployment management. Any model can have multiple
versions stored, and any one of those versions can be deployed

### Store Models

`wadm.api.{lattice}.model.put`

Model storage is _append-only_. New versions are added to the model's version history according to
retention policy and will not replace previously existing versions. This means that if you put a
model with the same version, it will be rejected. The `name` of the model is a unique identifier and
should be a valid NATS topic segment.

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

If the model and version being submitted already exist, the request will be _rejected_. Note that
this won't automatically deploy a model, it only affects storage. The response will tell the caller
how many versions are on file and the current version number _after_ the operation completed.

### Get Model List

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
required to be semver, only recommended). The `deployed_version` field will be set to the version
that is currently deployed. If no version is deployed, this field will be set to `null`. Please note
that `description` can also be `null` if no description was set

### Get a Model Spec

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
  "message": "Fetched model echo",
  "manifest": {
    "apiVersion": "core.oam.dev/v1beta1",
    "kind": "Application",
    "metadata": {
      "name": "echo",
      "annotations": {
        "description": "This is my app",
        "version": "v0.0.1"
      }
    },
    "spec": {
      "components": [
        {
          "name": "echo",
          "type": "actor",
          "properties": {
            "image": "wasmcloud.azurecr.io/echo:0.3.7"
          },
          "traits": [
            {
              "type": "spreadscaler",
              "properties": {
                "replicas": 1,
                "spread": []
              }
            },
            {
              "type": "linkdef",
              "properties": {
                "target": "httpserver",
                "values": {
                  "address": "0.0.0.0:8080"
                }
              }
            }
          ]
        },
        {
          "name": "httpserver",
          "type": "capability",
          "properties": {
            "image": "wasmcloud.azurecr.io/httpserver:0.19.1",
            "contract": "wasmcloud:httpserver"
          },
          "traits": [
            {
              "type": "spreadscaler",
              "properties": {
                "replicas": 1,
                "spread": []
              }
            }
          ]
        }
      ]
    }
  }
}
```

Note that the `manifest` field is the JSON serialization of the [OAM
model](https://github.com/wasmCloud/wadm/tree/main/oam)

### Version History

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
we do not require that the version field be semver.

### Delete Models

`wadm.api.{lattice}.model.del.{name}`

Deletes the named model with the supplied version number. If the `delete_all` flag is set, then all
versions of this model will be deleted. If you delete a model version (or the whole model) that is
currently deployed, then the resources will be undeployed automatically as well.

#### Request

```json
{
  "version": "1.0",
  "delete_all": false
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

## Managing Deployments

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

or

```json
{
  "non_destructive": true
}
```

for a non-destructive undeploy. This will stop managing, but will not destroy resources.

:::warning
Non-destructive undeploy is currently not implemented, but will be added in a future version. Please comment on [this issue](https://github.com/wasmCloud/wadm/issues/113) if you would like to see this feature and how you'd like it to behave
:::

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

### Deployment Status

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
