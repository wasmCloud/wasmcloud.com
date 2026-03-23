---
title: 'NATS Permissions'
description: 'Account and permission configuration for wasmCloud'
sidebar_position: 3
---

## Subject and Account Requirements

NATS Nkey hierarchies can be complex, and their structure varies depending on isolation requirements. In a system where Wasm components are executing from multiple tenants in a way that they are isolated from the control plane but not isolated from each other, the following structure is recommended:

1. 1 operator key (optionally signed with another operator key)
   1. 1 account key per tenant, signed with the above operator key
      1. 1 user key for wasmCloud Control Operations
      2. 1 user key for wasmCloud RPC Operations

## RPC User Permissions

User RPC keys need to be given access to the following subjects:

### Component RPC Access

1. `{lattice}.{component_id}.wrpc.>`
   - Example: `default.http-client.wrpc.>`
   - **Recommended:** To permit all traffic in a single lattice: `default.*.wrpc.>`
   - **Optional:** To permit all traffic to all lattices: `**.**.wrpc.>`

## Control User Permissions

The wasmCloud control user key should have access to the following subjects:

### Core Control Interface

1. `wasmbus.ctl.{version}.{lattice}.{noun}.{verb}.{optional_name}`
   - Example: `wasmbus.ctl.>`
   - Control interface operations can be further restricted by specifying the operation, version, lattice, noun, verb, host ID.

### Event Publishing

2. `wasmbus.evt.*.*`
   - For publishing cloud events

### wadm API Access

3. `wadm.>`
   - For wadm API access, command and event publishing

### Provider Communication

4. `wasmbus.rpc.>`
   - For communicating with capability providers

## Optional Extension Subjects

The following subjects are required for optional wasmCloud features:

### Configuration Services

5. `wasmbus.cfg.>`
   - For communicating with configuration services

### Policy Engines

6. `wasmcloud.policy`
   - For communicating with policy engines

### Secrets Backends

7. `wasmcloud.secrets.>`
   - For communicating with secrets backends

## Security Recommendations

- **Use separate credentials** for RPC and control interface connections in production environments
- **Enable TLS** on NATS servers to prevent eavesdropping
- **Principle of least privilege** - grant only the minimum required subject access
- **Regular key rotation** following your organization's security policies

## See Also

- [NATS Documentation on Authorization](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/authorization)
- [NATS JWT Authentication](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/jwt)
- [Connecting wadm to NATS](/docs/deployment/wadm/nats-credentials)
