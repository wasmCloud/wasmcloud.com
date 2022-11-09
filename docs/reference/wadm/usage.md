---
title: "Using wadm"
date: 2022-09-08T11:02:05+06:00
weight: 3
draft: false
---

Using `wadm` typically involves using the `wash` command line tool. However, you can also use wash's supporting library in your Rust application or, if you continue to the next section, you'll see the API reference if you want to interact with wadm directly over a NATS connection.

The following is an overview of the high level functionality exposed by `wadm`. To see the corresponding commands in the `wash` CLI, issue the following command:

```
wash app --help
```

### List Applications
This will retrieve a list of all applications that wadm knows about. Application specifications (also referred to in our documentation and code as "models") are stored _without regard to lattice_.
```
wash app list
```

### Get Specification
This lets you retrieve the model for a specific application version. You can retrieve both the original text (e.g. YAML) that you submitted and the vetted and normalized model in JSON format.
```
wash app get --name petclinic --version 0.0.1
```

### Version History
Retrieves the chronological version history of a given application
```
wash app history --name petclinic
```

### Put Specification
Performs an _idempotent_ put operation for an application specification _version_. Each time you put a model spec YAML to the server, it will either produce a new version or _be ignored_. Versions are _immutable_ and as such cannot be overwritten. If you wish to change anything about your spec, it needs to be done in a new version.
```
wash app put ./petclinic.yaml
```

### Delete Specification
Deletes a specific version of an application specification. You can optionally delete _all_ versions of a specification, but make sure you're aware of the consequences when you do this.
```
wash app delete --name petclinic --version 0.0.1
```

### Deploy Version
Application specification versions are deployed _to a given lattice_. When a specification is deployed, wadm will start monitoring the state of the relevant lattice. Once it is satisfied it has enough information, it will begin its _control loop_, where it constantly compares the desired state of an application with the actual state and issues the appropriate low-level imperative commands to reconcile the two.
```
wash app deploy --name petclinic --version 0.0.1
```

### Undeploy Version
Undeploying an application spec tells wadm to stop monitoring that deployment. For now, wadm does not support _destructive_ undeploys, so all resources originally provisioned for an application will _remain_ after that application is undeployed. In the near future, wadm will support destructive undeploys which can optionally remove previously provisioned resources.
```
wash app undeploy --name petclinic
```