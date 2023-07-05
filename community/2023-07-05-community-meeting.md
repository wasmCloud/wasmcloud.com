---
title: 2023-07-05 Community Meeting
authors: [brooks]
tags: [community, meeting]
description: Agenda, notes, and recording for the 2023-07-05 community meeting
---

import ReactPlayer from 'react-player/youtube';

### Agenda

- DEMO: `wash ui`, the detached washboard
- DISCUSSION: Actor Lifecycles

<!--truncate-->

### Meeting Notes
- DEMO: decoupled washboard
	- RFC https://github.com/wasmCloud/wasmCloud/issues/324 and https://github.com/wasmCloud/wasmCloud/issues/321 detail decoupling the dashboard from the OTP host with the feature focus on Rust.
	- Added a `wash ui` command that runs the UI.
	- Current washboard uses the Elixir library Phoenix which is embedded in the host
	- This implementation uses static web files, written using React, and uses the state synthesized by `wadm` to display the state of the lattice.
	- With a side-by-side comparison, we can see that the new implementation displays the same information as the previous washboard.
		- The demo featured interacting with the old washboard to launch and link components, and showing the new information on the newly written washboard
		- You can point the washboard at any NATS URL that has access to the lattice and is running wadm, it doesn't have to run alongside a host.
	- Still TODO:
		- Starting, stopping, and linking actors/providers.
	- Kevin: Biggest reason why the washboard doesn't really fit, is because it was originally built to show one host at a time. Extending that to show multiple made a difficult experience.
	- Jordan: I've been working on a similar UI and would love to collaborate.
	- Brooks: What technology did you use and why?
		- Lachlan: Considered Tauri, Rust electron alternative. Also should we use next, astro, React, Angular, svelte, any other framework. We settled on React not because they are bad by any means, just so we can provide a project that has maintainability. The React community is the largest of those projects, so using libraries like radix for accessibility is much easier than building from the ground up.
	- PR coming later this afternoon, packaged React library, which will be launch-able with `wash ui`.
	- Brooks: What's the scope of this washboard?
		- Monitoring and viewing the state of the lattice.
	- Jordan: Why can't we just run `wash app deploy ui` and run this as actors and the HTTP server provider instead?
		- Brooks: Because this UI is just static assets,
		- See recording for the full discussion.
- DISCUSSION: actor lifecycles
	- Vance: Implementing a REST service in wasmCloud is really easy and low friction
	- One of the problems we may get is a query for an entire collection, maybe with a filter. If the collection doesn't fit in the size of an HTTP response for one limit or another, what do we do?
	- Use case: Actor that manages collection of DNA sequences. Each one is 3.5GB, so if I have a request for one of these things, do I hand it to the HTTP provider? Is that too much data?
		- Real problem: supporting [RFC 7232](https://datatracker.ietf.org/doc/html/rfc7232) for conditional requests and content ranges, providing a certain amount of data in an HTTP response and then continuing returning more and more data.
	- Vance: What I want here is a continuation. Continue processing from where you left off with a pointer in the data. The normal pattern in erlang is to start a new ephemeral process that holds the state in its memory.
	- Could be solved with stateful actors, and being able to hold that in memory in the actor and have that actor handle subsequent requests.
		- Will need to ensure we do not hold gigabytes in an actors memory, as it may hit the address space limit or even wasmtime memory limits.
	- Victor: This seems to be discussing multiple problems, first and foremost around caching
	- Bailey:
		- These are the problems that should be solved
			- native supports for streams
			- stateful actors
	- Vance: I think we've identified wasmCloud is a friction-free way of implementing REST patterns, from a business perspective it's quick and easy until pagination and then it does not work. This is a hard requirement for some use cases and will affect people bringing wasmCloud to production.
	- See the call for the full discussion.

### Recording

<ReactPlayer url='https://youtu.be/FN9POjvwnZE' controls />

