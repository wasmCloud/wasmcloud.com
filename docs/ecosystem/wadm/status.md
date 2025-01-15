---
title: 'Application Status'
date: 2024-04-08T00:00:00+00:00
icon: 'ti-map' # themify icon pack : https://themify.me/themify-icons
description: 'Understanding the status of applications'
type: 'docs'
sidebar_position: 4
---

This page details the four different statuses that an application can have and what they mean. You will see the status of each application on the summary view of `wash app list`, or for an individual application by running `wash app status <app_name>`.

## Undeployed

The `Undeployed` state is assigned to an application after you use the [wadm API](/docs/ecosystem/wadm/api/) to put an application. This application is stored in the model store but none of the resources in the application are deployed or managed by wadm.

You can **deploy** any application that has the `Undeployed` status by running `wash app deploy <app> <version>`. Any deployed application can be **undeployed** by running `wash app undeploy <app>`.

## Reconciling

The `Reconciling` state is the intermediate state where wadm calculated the desired state of deploying an application and issued commands to reach this desired state. This means that wadm sent requests to relevant hosts in the lattice to start components, providers, establish links, or establish configuration.

Applications will always enter the `Reconciling` state right after you deploy them as wadm will issue all of the initial commands.

## Deployed

The `Deployed` state is assigned to an application once it reaches the desired state as specified in the manifest. When each component is deployed and scaled according to their scalers, each link is defined, and each piece of configuration is present, the application is fully deployed.

In this state wadm is actively monitoring all of those components, links, configurations, etc. If an event in the lattice modifies the current state of an application (e.g. a host is removed, so part of the application stops) wadm will re-enter the `Reconciling` state while it recalculates the desired state.

## Failed

The `Failed` state is assigned to an application anytime wadm cannot issue a command to reach its desired state. Most often this is caused either by no running hosts in a lattice, or not enough hosts running to satisfy a specific spread.

For example, given the following spread:

```yaml
traits:
- type: spreadscaler
    properties:
    instances: 5
    spread:
        - name: eastcoast
        requirements:
            zone: us-east-1
        weight: 80
        - name: westcoast
        requirements:
            zone: us-west-1
        weight: 20
```

The application will be in the `Failed` state if there aren't connected hosts with the `zone=us-east-1` and `zone=us-west-1` [labels](/docs/deployment/hosts/labels).

You can get more information about why an application is in the failed status by running `wash app status <app>` to see the reason why the application is in the failed state.
