---
slug: bringing-wasm-to-telecoms-with-cncf-wasmcloud
title: 'Bringing WebAssembly to Telecoms with CNCF wasmCloud'
image: '/img/cncf-wasmcloud-in-telecoms/cncf-wasmcloud-in-telecoms.jpg'
date: 2024-01-09T09:00:00+05:00
author: 'Taylor Thomas'
author_profile: 'https://twitter.com/_oftaylor'
description: 'How WebAssembly helps CSPs look beyond Kubernetes for faster, greener, and more secure software deployment'
draft: false
---

![wasmcloud in telecoms](/img/cncf-wasmcloud-in-telecoms/cncf-wasmcloud-in-telecoms.jpg)

The best evidence that we're on the right innovation path is the growing interest in wasmCloud from a variety of industries. wasmCloud has come a long way in the last 12 months alone and, as we approach the release of wasmCloud 1.0, the industrial use cases for our platform are quickly emerging.

<!--truncate-->

We're already familiar with how companies like [BMW](https://www.techtarget.com/searchitoperations/news/252527414/Server-side-WebAssembly-prepares-for-takeoff-in-2023) and [Adobe](https://www.cncf.io/blog/2022/11/17/better-together-a-kubernetes-and-wasm-case-study/) work with wasmCloud. Now, it's the turn of the telecoms industry to experiment with CNCF sandbox project wasmCloud, to see if there's an argument for replacing Kubernetes with Wasm in specific use cases. An international peer group of Communication Service Providers (CSPs) — Orange, Vodafone, Etisalat by e& and nbnCo, and their innovation partners SigScale, Wavenet and Comviva — have delivered a [successful Proof of Concept](https://www.cncf.io/blog/2024/01/05/bringing-webassembly-to-telecoms-with-cncf-wasmcloud/) to bring WebAssembly to telecoms.

This is the subject of a [freshly published CNCF (Cloud Native Computing Foundation) blog post](https://www.cncf.io/blog/2024/01/05/bringing-webassembly-to-telecoms-with-cncf-wasmcloud/), authored by the project team (full content below).

The PoC was created as a [TM Forum Catalyst Project](https://www.tmforum.org/catalysts/projects/C23.0.601/webassembly-canvas) which sought to create a completely vendor agnostic place to manage individual units of software – Open Digital Architecture (ODA) Components – within Canvas, the TM Forum's hosted management platform.

Why did they do it? Distributed IT architectures are expensive and difficult to run, and Kubernetes struggles to scale down to the edge. Added to this, every CSP strives to reduce emissions but modern compute methodologies don't make this easy. This early project demonstrates that Wasm **smooths the way towards a more interoperable, componentized architecture** and shows its promise to **create serious operational and financial efficiencies for the telecoms industry**.

## Bringing WebAssembly to Telecoms with CNCF wasmCloud

By the TM Forum's WebAssembly Canvas Catalyst team:

CSPs: Orange, Vodafone, Etisalat by e&, nbnCo
ISVs: SigScale, Wavenet, Comviva
CNCF Technology: CNCF wasmCloud, maintained by Cosmonic

### The Telecoms Sector Today

It's hard to think of a sector that has undergone more transformation than the telecoms sector. Traditional copper networks have made way for fiber optics, voice for IP-based services and, in the process, CSPs (communication service providers) are more akin to media organizations than the telephone operators of the past.

In recent years, CSPs have invested heavily in containers, specifically Kubernetes orchestration, to help them transform monolith architectures into agile estates of microservices. Investment has been particularly significant in operations and business support systems (OSS/BSS), such as account billing, management and support. Kubernetes has brought huge benefits, but it has its limitations.

CSPs are most interested in increasing operational agility and efficiency. Operating highly distributed IT estates is difficult and costly, and Kubernetes struggles to scale down to far-edge devices (e.g. cell towers or remote sensors). Emissions are also an important consideration for highly regulated companies like CSPs. As is energy consumption, particularly at the edge, where the cost of batteries and backup systems is an important factor. Added to this, Kubernetes is not completely technology agnostic, a growing consideration for this industry.

To address these issues, an international peer group of CSPs (Orange, Vodafone, Etisalat by e& and nbnCo) and their innovation partners (SigScale, Wavenet, Comviva), have delivered a successful Proof of Concept to bring WebAssembly to telecoms. As part of [TM Forum's Catalyst program](https://www.tmforum.org/catalysts/projects/C23.0.601/webassembly-canvas), [CNCF sandbox project wasmCloud](https://wasmcloud.com/) was identified for its open, portable, lightweight and low-boilerplate application development environment. It was chosen not only to help address operational inefficiencies but also to build a completely technology agnostic environment for managing individual units of software – Open Digital Architecture (ODA) Components – within Canvas, the TM Forum's hosted management platform.

This early experiment shows that WebAssembly, and CNCF wasmCloud, quickens the journey towards a more interoperable, componentized architecture and reveals its promise to create serious operational and financial efficiencies for the telecoms industry.

### Embracing an Open Digital Architecture

The [TM Forum](https://www.tmforum.org/) is the telecommunications standards authority and representative organization for users and vendors of OSS/BSS technology. The body provides technical guidance and access to tooling to its membership. It is also the custodian of a catalog of best-of-breed Open APIs, freely accessible to CSPs of all kinds.

These APIs support the TM Forum's core reference models – the business process framework ([eTOM](https://www.tmforum.org/oda/business/process-framework-etom/)) and the information framework ([SID](https://www.tmforum.org/oda/information-systems/information-framework-sid/)). All innovation is designed to support these core frameworks. Today, there are over 100 APIs in the TM Forum and, together, they comprise the Open Digital Architecture (ODA). This is described by the TM Forum as:

“_..a standardized cloud-native enterprise architecture blueprint for all elements of the industry from Communication Service Providers (CSPs), through suppliers to system integrators._”

### Components as Commodities

Why is this important? The ODA, and all its underlying APIs, represent a meaningful step towards the commoditization of individual units of software – ODA Components – and a fully-componentized approach to building services. The [ODA Canvas](https://www.tmforum.org/oda/deployment-runtime/oda-canvas/) takes this one step further, beyond the functional architecture of ODA Components towards a vision of ODA Component onboarding, deployment and lifecycle management, all in a managed hosted environment.

The plan was always to build ODA Canvas entirely on Kubernetes. But, with a clear focus on software componentization, the project team noticed the progress being made by the W3C Wasm WG and Bytecode Alliance, in building the WebAssembly component model and WASI-Preview 2. With this in mind, CSPs involved in this Catalyst Project wondered whether Wasm could bring an accelerated and more efficient approach to hosting and managing ODA Components in Canvas.

Led by Vance Shipley, CEO and founder of SigScale, the TM Forum WebAssembly Canvas Catalyst project is a collaboration between TM Forum peers Orange, Vodafone, Etisalat by e&, Australia's nbnCo, and OSS/BSS innovators SigScale, Wavenet and Comviva. The brief from the operators was simple:

- Make ODA Canvas and ODA Components technology agnostic.
- Explore whether it can be done with WebAssembly and CNCF wasmCloud.
- Demonstrate whether this approach has the potential to be more efficient than Kubernetes.

### Building WebAssembly Canvas with wasmCloud

WebAssembly Canvas was built on the premise that it should follow the the scope of the eTOM and SID frameworks, not defined by what Kubernetes does or doesn't permit. The project also aimed to prove the value of a service-based architecture. As such, the team designed a 5G Core Converged Charging System (CCS) use case; an integration project in which the functions of a decomposed CCS, and select ODA Components, are characterized by the flow of messages passing between them.

ODA Components integrate with the TM Forum's Open APIs (REST). Compared to the earlier container-based methodology, the alternative method was to write a service contract in Smithy, to implement an actor-to-actor interface with wasmCloud's SDK**.** The Catalyst Project showed both methods and highlighted the benefits of native wasmCloud interfacing while maintaining ODA interoperability.

### 5G Core Converged Charging Server (CCS) Use Case

Taking the Service Inventory ODA component as the first example, whose core function is to produce the [TMF638 Open API](https://www.tmforum.org/resources/standard/tmf638-service-inventory-api-user-guide-v5-0-0/), the team wrote an equivalent service contract in Smithy. The ODA Component was then fine-tuned for wasmCloud and actors were implemented for both interfaces. Actors for Product Inventory and Product Catalog ODA Components were also implemented.

Actors were also created for the functions of a decomposed 3GPP 5G CCS:

- Rating Function (RF)
- Account Balance Management Function (ABMF)
- Charging Function (CHF)

In total, six functions were implemented as wasmCloud Actors for this use case, including two versions of the ODA Component for Service Inventory.

![Image of 5G core converged charging system](/img/cncf-wasmcloud-in-telecoms/tm-forum-5g-core-converged-charging-system.png)

Each of the ODA Components, and the 5GC CCS, were defined as application deployments and lifecycle managed with wadm.

In this model, the Service Inventory ODA component exposes the TMF 638 API using wasmCloud's HTTP server capability provider, and uses the Redis key-value store at the back end for persistence. This is stateless and ephemeral; instances are destroyed once a request is fulfilled making the process lightweight and resource efficient. In the kiosk demonstration, the team can pull up a shell and run a curl command which adds the service to the inventory, then returns the created service with a correctly assigned ID.

![TM Forum service inventory ODA component](/img/cncf-wasmcloud-in-telecoms/tm-forum-service-inventory-oda-component.png)

The project team then created another identical Service Inventory Actor (Service Inventory A-A actor) which implemented the native contract in the front end, but with the same back end as the original, to allow them to interoperate. The CCS RF Actor would use the native interface with other use cases could use the Open API version of the Actor for the ODA Component.

What this means is two different actors are defined, one with a REST front end, the other with a native contract front end, lifecycle-managed with Wadm and both running and communicating harmoniously in wasmCloud. Within that environment, actors exchange messages in a circuit; the HTTP server capability provider exposes an external network and routes the reply back to the target actor.

ODA Canvas has been realized on wasmCloud, utilizing Wasm actors and capability providers to compose ODA Components.

### Real World Impact

What does this all mean in the real world? The project revealed the potential operational efficiencies and performance gains of WebAssembly Canvas running on wasmCloud, versus ODA Canvas running on Kubernetes. In the following chart, it's possible to see the operational overhead created in the primitive Canvas, versus WebAssembly canvas which strips away layers of complexity and inefficiencies to create dependency-free, agile application management.

In the message sequence chart comparison below, the larger yellow section denotes the profile of ODA Canvas with REST APIs, while the green section denotes the profile of the native interface in wasmCloud. Why is the yellow section so much larger than the green? Because the REST APIs require HTTP server and client capability providers and external networking, bringing with it increased carbon emissions, energy costs, latency and technical complexity whilst wasmCloud eliminates all these extra overheads. CSPs run large enough estates that they can't afford to ignore this overhead, particularly if there's a credible and community-based solution to fix it.

![Image of TM Forum Wasm Canvas benefits](/img/cncf-wasmcloud-in-telecoms/tm-forum-wasm-canvas-benefits.png)

Figure 3. The yellow section denotes the unnecessary overhead of an HTTP protocol stack in actor integration. The green section represents the optimal pattern, when a contract is created for the services an actor provides.

The project demonstrates WebAssembly Canvas is significantly leaner and more efficient than ODA Canvas built on Kubernetes. According to the CSP project champions, WebAssembly has the potential to bring several major benefits:

- **Portability:** software compiled to Wasm may run anywhere, independent of CPU architecture.
- **Security:** CNCF wasmCloud processes run in a sandboxed environment with strictly controlled capabilities.
  - Wasm limits the attack surface of an application by removing the need for imported libraries. Dependencies are applied at runtime.
- **Energy:** a Wasm application stack is smaller, requires less resources and may be placed to better match available hardware, reducing emissions and saving energy.
- **Responsiveness:** an ephemeral process in wasmCloud is instantiated in microseconds, enabling performant serverless application architecture.
- **Efficient Application Lifecycle:** overall, there is less code to maintain, updated only when the business logic evolves.
- **Edge:** seamlessly operates across any edge, from base stations to mobile devices

This successful TM Forum Catalyst Project was singled out for an honorable mention during the recent Digital Transformation Awards, and has piqued the interest of many CSPs across the industry. Today, the majority of the work in this area is focused on VMware and container deployments. However, this project aims to push the boundaries of efficient, portable, and secure application hosting by exploring WebAssembly and wasmCloud at the advanced edge. By rapidly prototyping open-source ODA Components and Canvas within a short timeframe, the project's objective is to showcase the potential of WebAssembly and CNCF wasmCloud in the context of Open Digital Architecture (ODA).

### In summary

As we move into a more sustainable age, CSPs are looking to technology to help them do their part in lowering carbon footprints. As this early use case has shown, WebAssembly and CNCF wasmCloud provide the conditions to drastically reduce the complexity of building and running ODA components in disparate locations, and to lower reliance on expensive, energy-hungry resources. Above all, what this reveals is a world beyond containers, where all components are free to roam and treated as first-class citizens.

- [Catalyst Projects](https://www.tmforum.org/catalysts) are a major feature of the TM Forum's annual trade event, Digital Transformation World. There are 55 Catalyst Projects which see champions (CSPs) and participants (OSS/BSS technology providers) come together to work on experimental, non-commercial, user-defined projects.
