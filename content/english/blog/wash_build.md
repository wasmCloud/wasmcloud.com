---
title: "wasmcloud.toml & wash build"
image: "images/blogs/ij_map_sample.jpeg"
date: 2022-09-28T9:00:00-04:00
author: "Matt Wilkinson"
author_profile: "https://www.linkedin.com/in/mattwilkinsonn/"
description: "Enhancing the wasmCloud developer experience"
categories: ["webassembly", "wasmcloud", "compliers", "wash", "build"]
draft: true
---

## wash 0.13 - `wash build`

In wash 0.13 we added a new top-level command to wash, `wash build`!

`wash build` is our attempt at simplifying some of the most common patterns wasmCloud developers face - the building (and signing) of actors, providers, and interfaces. These tasks are essential to any wasmCloud developer, so we want to make the developer experience here as good as possible.

### But the Makefiles!

Any current wasmCloud developer is reading this scratching their head - we already have a build system for actors/providers/interfaces! All of the templates come with Makefiles perform the same task. But Makefiles (and the way we've used them) have some drawbacks:

- Their support on Windows is poor and leads to many bugs.
- Creating language and toolchain-specific Makefiles will lead to drift and a significant amount of overhead, as well as making them very difficult impossible to change later.
- We're using one Makefile as basically a configuration file, which isn't it's intended purpose and can be confusing for newcomers. It also makes it difficult to use this data outside of Make.
- The developer experience of Makefiles is lacking. A brand new wasmCloud developer shouldn't have to learn the (fairly) esoteric Make syntax just to name their actor.
- Putting some of our most commonly used tasks inside a Makefile which needs to be inside every project doesn't led itself well to the optimal developer experience and "zero boilerplate" philosphy we're aiming for.

That was a big list of negatives about Make. Don't get me wrong though, I think it is a great tool, and was fantastic as a quick way to get a build system for wasmCloud working, but the wasmCloud use case is quickly outgrowing it.

So how do we solve these problems? `wash build`. But first let's talk about `wash build`'s companion, `wasmcloud.toml`.

### wasmcloud.toml