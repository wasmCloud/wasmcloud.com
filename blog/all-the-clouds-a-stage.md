---
slug: all-the-clouds-a-stage-webassembly-actor
title: "All the Cloud's a Stage, and WebAssembly Modules Mere Actors"
image: "/img/child_actor.jpg"
date: 2023-03-30T09:00:00+05:00
author: "Kevin Hoffman"
author_profile: "https://twitter.com/autodidaddict"
description: "An overview on the actor model with a focus on WebAssembly"
draft: false
---

![child actor image](/img/child_actor.jpg)

The actor model is a model for concurrent computation originally developed in 1973. This classic definition says that in response to a message, an actor may:

- Make local decisions
- Create more actors
- Send messages
- Determine how to respond to the next message

<!--truncate-->

There are dozens of actor model implementations out there from Akka to wasmCloud. One aspect of the model implementation differentiates wasmCloud from the majority. In this post we’ll take a look at the notion of actors creating more actors and see why people have historically wanted this ability in their frameworks and how wasmCloud accomplishes the same goals but without manual supervision tree management.

## Spawning Child Actors

For example, in Akka, the only way you can start an actor is inside an actor. There are a couple of pretty common use cases that revolve around spawning sub-actors or children. The first, and probably the most common, arises when an actor needs to spawn children to work on a task, and then be able to dispose of those children when the task is complete.

The next most common use case is for building supervision trees. This is where, when an actor starts another actor, the parent now has logic built into it to deal with various scale or failure conditions in the child. This helps us to understand, through an actor supervisor, the behavior and logic that may have caused it to fail.

Another common reason to have actors starting other ones is for resiliency. In this case you might want to run a backup and, if an actor dies, be able to resurrect it. Some of that goes back to the supervision tree concept, but these three examples illustrate why most of us want to create actors within actors.

Specifically, when it comes to wasmCloud, all of our actors are stateless, at least in today's world. If you consider, therefore, the list of children that an actor supervises to be state, you start to see where the waters get a little muddy. For example, how does a stateless actor manage a supervision tree of stateless actors without maintaining its own internal state, or without forcing children to maintain their own internal state?

## Actor Supervision

The general approach, thus far, has been that actor supervision is something the wasmCloud runtime takes care of by default. So, when you run an actor, we're responsible for making sure that it comes back from the dead after it dies and that, if you want to scale out 10 copies of it, you can.

If you want to communicate between actors, we make that happen without you needing to have a supervisory relationship. One of the ways we can manage workflows that typically require people to be able to create their own actors comes from our declarative application deployment manager, or wadm. So, if you want to declare that you need to maintain 10 instances of this actor across a spread of five hosts, all of which have a certain set of characteristics, Wadm will do that for you. More importantly, the actors don't know that's how things are being done.

## Manual vs External

One of the things that's always bothered me about the way manual actor supervision happens in tools like Akka is that, if I write code to spawn a child actor, my code isn't business logic, it's more like infrastructure. Now, though, it's tightly coupled with my business logic because it's sitting right there in the actor. What that typically means is that I can’t dynamically alter the way in which my actors scale and are supervised without refactoring, recompiling, and redeploying.

What I like about external management is the actors themselves remain internally consistent, and also blissfully ignorant of how they're being supervised and managed. All they are is stateless business logic.

If I want to run an instance of my stateless business logic on my laptop, that's easy to do in any framework. But, what if I want to run 300 instances of it, spread across three dynamic regions, with multiple cloud providers, all with a specific set of scaling characteristics? That's also possible, but because the actors aren't responsible for spawning their own children, the actors are ignorant of the scale and shape of the infrastructure into which they're deployed.

It’s really easy, especially for those of us who really love Akka, to want the ability to create a child actor and be able to spawn new actors within an existing one, but I think this is a dangerous knee-jerk reaction. I really think that, for the cases described, the external management of actors is going to work better in the long run.

## Supervision Trees

Now, there are other really valid use cases for which people have used supervision trees, that we can still do without supervision trees. For example, if I want to spawn a long running piece of work, and receive the results when it's complete, that's probably something more more appropriately suited to the capability provider paradigm where I tell my provider, “here's a bunch of long running work that I want you to do. I want you to scale it how you see fit, then send me a message when you're done that contains the completed payload.”

That's still pure business logic. I want this business logic to run on-demand and I want to be notified about what happened. Whether or not an actor supervision tree is spawned in order to make that happen is something that occurs outside the scope and visibility of the actor.

The most important thing, when designing these kinds of projects, is to take a step back and consider what you want from this actor supervision tree. Am I doing this because that's just how I've managed work like that in the past? Or, is what I really want, the ability to run a particular function, spread out according to how much it needs to scale, against this particular large data set and then to be informed when the results are completed?

The latter of what I just described is pure business logic that remains pure regardless of scale or infrastructure. Writing code that says ‘spin up 200 children’ is infrastructure. Writing code that says ‘do this work and let me know when it’s done’ is business logic.

Infrastructure is the dynamic runtime shape of my environment that my actors should not know about. This view may be controversial, but I firmly believe that separating my business logic from my supervision tree is crucial to being able to easily, securely, and reliably build distributed applications.

Check out our [documentation](/docs/intro) to get started with wasmCloud.
