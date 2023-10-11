---
title: "Security"
date: 2018-12-29T11:02:05+06:00
sidebar_position: 0
draft: false
description: "wasmCloud Ecosystem Security"
---

wasmCloud embraces a [zero trust](https://en.wikipedia.org/wiki/Zero_trust_networks) security model. This means that the runtime, by default, does not trust any actor with the ability to do anything. Without adding security claims to an actor, the actor cannot send or receive messages in a wasmCloud runtime environment.

### Embedding JSON Web Tokens

Every actor in the ecosystem is a WebAssembly module that contains an embedded [JSON Web Token](https://jwt.io/). These tokens have a standard set of required fields, including:

- **Issuer** - As the name implies, the issuer of the token. The JWT specification requires only that this be a string.
- **Subject** - The subject is the subject of the token, the identity of the thing to which the token corresponds.
- **Not Valid Before** - A timestamp indicating that a token cannot be used until a given time/date.
- **Expiration** - A timestamp indicating when a token will expire.

In our ecosystem, the issuer of an actor is the unique public key of an **account** (see the _Key Types_ section below), and the subject of an actor is the actor's public key.

The [wash](/docs/fundamentals/wash) tool is responsible for creating keys and extracting and embeddeding signed JWTs within actor modules.

Each JWT embedded within an actor is cryptographically signed using the [ed25519](https://ed25519.cr.yp.to/) signature algorithm. For information on why we chose this method of security over others, please check out our [Archictural Decision Record](https://wasmcloud.github.io/adr/).

### Actor Identity

As you may have picked up from reading about **ed25519** keys and encryption, this is an _asymmetric_ process. What wasmCloud uses is a fit-for-purpose implementation of [Public Key Infrastructure](https://en.wikipedia.org/wiki/Public_key_infrastructure). This means that each actor is given a private key, called a **seed** key in **ed25519** terminology (you will likely see the word _seed_ appear multiple times in our tooling). Each seed corresponds to one globally unique public key.

This means that if an account (the _issuer_ of an actor's embedded JWT) signs a token using its private key, then we can use the account's _public key_ to verify the signature on the JWT. This has the added benefit of making JWT's _verifiable in public_. That is, they contain no secrets, but cannot be created without access to secrets. This makes them an ideal format for bearer-type credentials and claims in a model of decentralized security.

Further, since one of the claims (discussed next) in the token is a _hash_ of the unaltered bytes of the WebAssembly module, we can tell if a signed module has been tampered with because we can detect if the hash field has changed because that would invalidate the signature.

### Claims

In addition to the standard claims required by all [JSON Web Token (JWT)](https://jwt.io/)s, wasmCloud adds an additional claim field called **wascap** (wasmCloud capabilities). _All_ wasmCloud-related metadata exists under this field in the token's JSON structure. The following JSON shows the metadata field for one of our sample actors:

```json
{
  "jti": "l9Zs9GoqtfRomuPSrhe9eT",
  "iat": 1586451767,
  "iss": "AAGRUXXTGSP4C27RWPTMCHCJF56JD53EQPA2R7RPC5VI4E274KPRMMJ5",
  "sub": "MASCXFM4R6X63UD5MSCDZYCJNPBVSIU6RKMXUPXRKAOSBQ6UY3VT3NPZ",
  "wascap": {
    "name": "Key Value Counter",
    "hash": "4B4BCE3588955E068DC9D32382C8727CBF46819C907AB3A1630ED7B97C530D13",
    "tags": [],
    "caps": ["wasmcloud:keyvalue", "wasmcloud:httpserver"],
    "prov": false
  }
}
```

Here one of the most important fields in the `wascap` object is the `caps` field, which contains an array of _capability contract IDs_. Each capability provider must conform to a single, globally unique contract identifier. This ID is typically prefixed with a namespace or vendor prefix, but is not a requirement.

The preceding token indicates that the _Key Value Counter_ actor has been granted access to the Key-Value and HTTP Server capabilities, _without regard_ for which specific provider is used to satisfy those capabilities. In other words, this actor can use _any_ key-value provider, be it Redis or Cassandra or Consul. If you want to further limit which capabilities can be used by actors at runtime, you can define and utlize an [OPA](https://www.openpolicyagent.org/) policy.

### Managing Keys

The act of key management could be a book or tome all its own. In short, managing keys in wasmCloud involves managing the 57-character plain ASCII strings that represent the developer-friendly encoding of ed25519 keys. The entire security system of wasmCloud is designed around the idea that, while running in a production (or any) environment, _no private key access is required_. You will never need to expose a private key to any portion of your running environment.

That said, you will need to ensure that offline access to your keys is secured. Your choice for how you do that is entirely up to you and the needs of your organization.

#### Key Types

wasmCloud uses a special, user-friendly encoding for ed25519 keys that is identical to the encoding used by [NATS](https://nats.io) for its 2.0+ decentralized security mechanism. This encoding uses all uppercase letters with an **S** prefix for seeds followed by a key type prefix. An underrated benefit of this key encoding mechanism is that keys are double-clickable for easy copy-and-paste on most operating systems and a fixed length.

While the number of key encodings available is larger than this list, the following are key types that may be of interest to wasmcloud developers:

- Actor (**M**odule) - Produces public keys with the **M** prefix.
- **A**ccount - Produces public keys with the **A** prefix, typically used as _issuers_ of actor modules.
- Capability Pro**v**ider (Ser**v**ice) - Produces public keys with the **V** prefix.
- Server/**N**ode - Produces public keys with the **N** (node) prefix, used by the host runtime.
- **O**perator - Produces public keys with the **O** prefix.
- **C**luster - Produces public keys with the **C** prefix, used by the [lattice](/docs/reference/glossary#lattice).

As mentioned, _by convention_, actor tokens are issued by accounts. **A**ccounts are, by convention, issued by operators. Ser**v**ices (capability pro**v**iders) are also issued/signed by accounts. Servers (wasmcloud processes/**n**odes) are currently self-issued/self-signed, leaving the crucial lattice security up to the **C**luster keys.
