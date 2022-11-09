---
title: "Namespace Prefix"
date: 2018-12-29T11:02:05+06:00
weight: 1
draft: false
---

Lattices are designed to support multi-tenancy in that you can run multiple, isolated lattices on the same NATS cluster without
risking overlapping traffic. This is made possible through the use of a _namespace prefix_. Every lattice has one and the
NATS topic space is sub-divided beneath this prefix.

If you don't specify a namespace prefix, wasmCloud will use `default` as the prefix name. This is fine when you're working
on your development machine in isolation, but when you're running in a production environment you might want to consider providing
an explicit namespace for the lattice to avoid any chance of accidental overlap.

The main thing to be wary of is running multiple lattices without specifying a prefix, as they will all adopt the `default` prefix and merge into one unified lattice.


### Character sets

To ensure compatibility with current and future wasmcloud protocols, certain tokens should be limited to the character sets defined below.


| name           | characters   | description                                                         |
|----------------|--------------|---------------------------------------------------------------------|
| lattice_prefix | `a-zA-Z0-9_-`  | Ascii uppercase and lowercase letters, digits, underscore, and dash |
| link_name      | `a-zA-Z0-9_-` | same as lattice_prefix_chars                                        |
| contract_name  | `a-zA-Z0-9_-:` | same as lattice_prefix_chars, plus colon                            |
