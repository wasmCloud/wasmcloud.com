---
title: "API Reference"
sidebar_position: 3
---

## Packages
- [runtime.wasmcloud.dev/v1alpha1](#runtimewasmclouddevv1alpha1)


## runtime.wasmcloud.dev/v1alpha1

Package v1alpha1 contains API Schema definitions for the runtime v1alpha1 API group.

### Resource Types
- [Artifact](#artifact)
- [ArtifactList](#artifactlist)
- [Host](#host)
- [HostList](#hostlist)
- [Workload](#workload)
- [WorkloadDeployment](#workloaddeployment)
- [WorkloadDeploymentList](#workloaddeploymentlist)
- [WorkloadList](#workloadlist)
- [WorkloadReplicaSet](#workloadreplicaset)
- [WorkloadReplicaSetList](#workloadreplicasetlist)



#### Artifact



Artifact is the Schema for the artifacts API.



_Appears in:_
- [ArtifactList](#artifactlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `Artifact` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[ArtifactSpec](#artifactspec)_ |  |  |  |


#### ArtifactList



ArtifactList contains a list of Artifact.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `ArtifactList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[Artifact](#artifact) array_ |  |  |  |


#### ArtifactSpec



ArtifactSpec defines the desired state of Artifact.



_Appears in:_
- [Artifact](#artifact)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `image` _string_ |  |  | Required: \{\} <br /> |
| `imagePullSecret` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#localobjectreference-v1-core)_ |  |  | Optional: \{\} <br /> |




#### ConfigLayer







_Appears in:_
- [HostInterface](#hostinterface)
- [LocalResources](#localresources)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `configFrom` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#localobjectreference-v1-core) array_ | ConfigFrom is a list of references to ConfigMaps that will be provided to the workload.<br />The keys and values of all referenced ConfigMaps will be merged. In case of key conflicts,<br />the last ConfigMap in the list wins. |  | Optional: \{\} <br /> |
| `secretFrom` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#localobjectreference-v1-core) array_ | The keys and values of all referenced Secrets will be merged. In case of key conflicts,<br />the last Secret in the list wins.<br />The values of the Secrets will be base64-decoded, utf-8 decoded before being provided to the workload. |  | Optional: \{\} <br /> |
| `config` _object (keys:string, values:string)_ |  |  | Optional: \{\} <br /> |


#### EphemeralVolume



EphemeralVolume represents a temporary directory that shares a workload's lifetime.



_Appears in:_
- [Volume](#volume)



#### Host



Host is the Schema for the Hosts API.



_Appears in:_
- [HostList](#hostlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `Host` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `hostId` _string_ |  |  | Required: \{\} <br /> |
| `hostname` _string_ |  |  | Optional: \{\} <br /> |
| `httpPort` _integer_ |  |  | Optional: \{\} <br /> |


#### HostInterface







_Appears in:_
- [WorkloadSpec](#workloadspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `configFrom` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#localobjectreference-v1-core) array_ | ConfigFrom is a list of references to ConfigMaps that will be provided to the workload.<br />The keys and values of all referenced ConfigMaps will be merged. In case of key conflicts,<br />the last ConfigMap in the list wins. |  | Optional: \{\} <br /> |
| `secretFrom` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#localobjectreference-v1-core) array_ | The keys and values of all referenced Secrets will be merged. In case of key conflicts,<br />the last Secret in the list wins.<br />The values of the Secrets will be base64-decoded, utf-8 decoded before being provided to the workload. |  | Optional: \{\} <br /> |
| `config` _object (keys:string, values:string)_ |  |  | Optional: \{\} <br /> |
| `namespace` _string_ |  |  | Required: \{\} <br /> |
| `package` _string_ |  |  | Required: \{\} <br /> |
| `interfaces` _string array_ |  |  | MinItems: 1 <br />Required: \{\} <br /> |
| `version` _string_ |  |  | Optional: \{\} <br /> |


#### HostList



HostList contains a list of Host.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `HostList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[Host](#host) array_ |  |  |  |


#### HostPathVolume



HostPathVolume represents a pre-existing file or directory on the host machine.



_Appears in:_
- [Volume](#volume)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `path` _string_ | Path of the file or directory on the host. |  | Required: \{\} <br /> |




#### LocalResources



LocalResources describes resources that will be made available to a workload component.



_Appears in:_
- [WorkloadComponent](#workloadcomponent)
- [WorkloadService](#workloadservice)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `volumeMounts` _[VolumeMount](#volumemount) array_ | VolumeMounts is a list of volume mounts that will be mounted into the workload component.<br />The volumes must be defined in the WorkloadSpec.Volumes field. |  | Optional: \{\} <br /> |
| `environment` _[ConfigLayer](#configlayer)_ |  |  | Optional: \{\} <br /> |
| `config` _object (keys:string, values:string)_ |  |  | Optional: \{\} <br /> |
| `allowedHosts` _string array_ |  |  | Optional: \{\} <br /> |


#### ReplicaSetStatus







_Appears in:_
- WorkloadDeploymentStatus
- WorkloadReplicaSetStatus

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `expected` _integer_ |  |  | Optional: \{\} <br /> |
| `current` _integer_ |  |  | Optional: \{\} <br /> |
| `ready` _integer_ |  |  | Optional: \{\} <br /> |
| `unavailable` _integer_ |  |  | Optional: \{\} <br /> |


#### Volume



Volume represents a named volume that can be mounted by components.



_Appears in:_
- [WorkloadSpec](#workloadspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name of the volume. Must be a DNS_LABEL and unique within the Workload. |  | Required: \{\} <br /> |
| `ephemeral` _[EphemeralVolume](#ephemeralvolume)_ | EphemeralVolume represents a temporary directory that shares a workload's lifetime. |  | Optional: \{\} <br /> |
| `hostPath` _[HostPathVolume](#hostpathvolume)_ | HostPathVolume represents a pre-existing file or directory on the host machine. |  | Optional: \{\} <br /> |


#### VolumeMount



VolumeMount describes a mounting of a Volume within a component.



_Appears in:_
- [LocalResources](#localresources)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name must match the Name of a Volume defined in the WorkloadSpec.Volumes field. |  | Required: \{\} <br /> |
| `mountPath` _string_ | MountPath is the path within the component where the volume should be mounted. |  | Required: \{\} <br /> |


#### Workload



Workload is the Schema for the artifacts API.



_Appears in:_
- [WorkloadList](#workloadlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `Workload` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[WorkloadSpec](#workloadspec)_ |  |  |  |


#### WorkloadComponent



WorkloadComponent represents a component of a workload.
Components are stateless, invocation-driven units of computation.
Components are isolated from each other and can be scaled independently.
Each Component has a Root WIT World, representing the Components imports/exports. The combined
list of all Components' Root WIT Worlds within a workload must be compatible with the Host's WIT World.
All components within a workload are guaranteed to be placed on the same Wasm Host.



_Appears in:_
- [WorkloadSpec](#workloadspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ |  |  | Required: \{\} <br /> |
| `image` _string_ |  |  | Required: \{\} <br /> |
| `imagePullSecret` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#localobjectreference-v1-core)_ |  |  | Optional: \{\} <br /> |
| `poolSize` _integer_ |  |  | Optional: \{\} <br /> |
| `maxInvocations` _integer_ |  |  | Optional: \{\} <br /> |
| `localResources` _[LocalResources](#localresources)_ |  |  | Optional: \{\} <br /> |


#### WorkloadDeployPolicy

_Underlying type:_ _string_





_Appears in:_
- [WorkloadDeploymentSpec](#workloaddeploymentspec)

| Field | Description |
| --- | --- |
| `RollingUpdate` |  |
| `Recreate` |  |


#### WorkloadDeployment



WorkloadDeployment is the Schema for the artifacts API.



_Appears in:_
- [WorkloadDeploymentList](#workloaddeploymentlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `WorkloadDeployment` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[WorkloadDeploymentSpec](#workloaddeploymentspec)_ |  |  |  |


#### WorkloadDeploymentArtifact







_Appears in:_
- [WorkloadDeploymentSpec](#workloaddeploymentspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ |  |  | Required: \{\} <br /> |
| `artifactFrom` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#localobjectreference-v1-core)_ |  |  | Required: \{\} <br /> |


#### WorkloadDeploymentList



WorkloadDeploymentList contains a list of HttpTrigger.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `WorkloadDeploymentList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[WorkloadDeployment](#workloaddeployment) array_ |  |  |  |


#### WorkloadDeploymentSpec



WorkloadDeploymentSpec defines the desired state of WorkloadDeployment.



_Appears in:_
- [WorkloadDeployment](#workloaddeployment)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `replicas` _integer_ |  |  | Optional: \{\} <br /> |
| `template` _[WorkloadReplicaTemplate](#workloadreplicatemplate)_ |  |  | Required: \{\} <br /> |
| `deployPolicy` _[WorkloadDeployPolicy](#workloaddeploypolicy)_ |  | RollingUpdate | Optional: \{\} <br /> |
| `artifacts` _[WorkloadDeploymentArtifact](#workloaddeploymentartifact) array_ |  |  | Optional: \{\} <br /> |




#### WorkloadList



WorkloadList contains a list of Workload.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `WorkloadList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[Workload](#workload) array_ |  |  |  |


#### WorkloadReplicaSet



WorkloadReplicaSet is the Schema for the artifacts API.



_Appears in:_
- [WorkloadReplicaSetList](#workloadreplicasetlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `WorkloadReplicaSet` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[WorkloadReplicaSetSpec](#workloadreplicasetspec)_ |  |  |  |


#### WorkloadReplicaSetList



WorkloadReplicaSetList contains a list of WorkloadReplicaSet.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `runtime.wasmcloud.dev/v1alpha1` | | |
| `kind` _string_ | `WorkloadReplicaSetList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[WorkloadReplicaSet](#workloadreplicaset) array_ |  |  |  |


#### WorkloadReplicaSetSpec



WorkloadReplicaSetSpec defines the desired state of WorkloadReplicaSet.



_Appears in:_
- [WorkloadDeploymentSpec](#workloaddeploymentspec)
- [WorkloadReplicaSet](#workloadreplicaset)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `replicas` _integer_ |  |  | Optional: \{\} <br /> |
| `template` _[WorkloadReplicaTemplate](#workloadreplicatemplate)_ |  |  | Required: \{\} <br /> |




#### WorkloadReplicaTemplate







_Appears in:_
- [WorkloadDeploymentSpec](#workloaddeploymentspec)
- [WorkloadReplicaSetSpec](#workloadreplicasetspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `annotations` _object (keys:string, values:string)_ |  |  | Optional: \{\} <br /> |
| `labels` _object (keys:string, values:string)_ |  |  | Optional: \{\} <br /> |
| `spec` _[WorkloadSpec](#workloadspec)_ |  |  | Required: \{\} <br /> |


#### WorkloadService



WorkloadService represents a long-running service that is part of the workload.
It is also sometimes referred to as a "sidecar" and is optional.
A Service differs from a Component in that it is long-running and represents the Workload's "localhost".
Services can bind to TCP & UDP ports, which are accessible by Components within the same workload via "localhost" or "127.0.0.1".
Services export a single WIT interface, shaped as wasi:cli/run.
Services can import interfaces from any Component within the same workload, or from the Host.



_Appears in:_
- [WorkloadSpec](#workloadspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `image` _string_ |  |  | Required: \{\} <br /> |
| `imagePullSecret` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.31/#localobjectreference-v1-core)_ |  |  | Optional: \{\} <br /> |
| `maxRestarts` _integer_ |  |  | Optional: \{\} <br /> |
| `localResources` _[LocalResources](#localresources)_ |  |  | Optional: \{\} <br /> |


#### WorkloadSpec



WorkloadSpec defines the desired state of Workload.



_Appears in:_
- [Workload](#workload)
- [WorkloadReplicaTemplate](#workloadreplicatemplate)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `hostSelector` _object (keys:string, values:string)_ |  |  | Optional: \{\} <br /> |
| `hostId` _string_ |  |  | Optional: \{\} <br /> |
| `components` _[WorkloadComponent](#workloadcomponent) array_ |  |  | Optional: \{\} <br /> |
| `hostInterfaces` _[HostInterface](#hostinterface) array_ |  |  | Optional: \{\} <br /> |
| `service` _[WorkloadService](#workloadservice)_ |  |  | Optional: \{\} <br /> |
| `volumes` _[Volume](#volume) array_ |  |  | Optional: \{\} <br /> |




