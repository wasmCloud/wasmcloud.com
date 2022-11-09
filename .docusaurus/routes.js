import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/blog',
    component: ComponentCreator('/blog', 'fad'),
    exact: true
  },
  {
    path: '/blog/2022-05-23_ghcr-actions',
    component: ComponentCreator('/blog/2022-05-23_ghcr-actions', 'db5'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '38c'),
    exact: true
  },
  {
    path: '/blog/balancing_nfr_coupling',
    component: ComponentCreator('/blog/balancing_nfr_coupling', '016'),
    exact: true
  },
  {
    path: '/blog/caps_are_effects',
    component: ComponentCreator('/blog/caps_are_effects', '4fb'),
    exact: true
  },
  {
    path: '/blog/example_creating_webassembly_actor_in_go_with_tinygo',
    component: ComponentCreator('/blog/example_creating_webassembly_actor_in_go_with_tinygo', '29a'),
    exact: true
  },
  {
    path: '/blog/globally_distributed_webassembly_applications_with_wasmcloud_and_nats',
    component: ComponentCreator('/blog/globally_distributed_webassembly_applications_with_wasmcloud_and_nats', '0ab'),
    exact: true
  },
  {
    path: '/blog/road_to_ubiquity',
    component: ComponentCreator('/blog/road_to_ubiquity', '2a6'),
    exact: true
  },
  {
    path: '/blog/wasmcloud_third_anniversary',
    component: ComponentCreator('/blog/wasmcloud_third_anniversary', '074'),
    exact: true
  },
  {
    path: '/blog/webassembly_components_and_wasmcloud_actors_a_glimpse_of_the_future',
    component: ComponentCreator('/blog/webassembly_components_and_wasmcloud_actors_a_glimpse_of_the_future', '080'),
    exact: true
  },
  {
    path: '/community',
    component: ComponentCreator('/community', '821'),
    exact: true
  },
  {
    path: '/community/2022/11/02/community-meeting',
    component: ComponentCreator('/community/2022/11/02/community-meeting', '2e5'),
    exact: true
  },
  {
    path: '/community/2022/11/09/community-meeting',
    component: ComponentCreator('/community/2022/11/09/community-meeting', '566'),
    exact: true
  },
  {
    path: '/community/archive',
    component: ComponentCreator('/community/archive', '23c'),
    exact: true
  },
  {
    path: '/community/tags',
    component: ComponentCreator('/community/tags', 'f1d'),
    exact: true
  },
  {
    path: '/community/tags/community',
    component: ComponentCreator('/community/tags/community', '458'),
    exact: true
  },
  {
    path: '/community/tags/meeting',
    component: ComponentCreator('/community/tags/meeting', '251'),
    exact: true
  },
  {
    path: '/community/welcome-community',
    component: ComponentCreator('/community/welcome-community', '8f8'),
    exact: true
  },
  {
    path: '/privacy-policy',
    component: ComponentCreator('/privacy-policy', '54c'),
    exact: true
  },
  {
    path: '/terms-conditions',
    component: ComponentCreator('/terms-conditions', '64a'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '932'),
    routes: [
      {
        path: '/docs/app-dev/',
        component: ComponentCreator('/docs/app-dev/', '28b'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/a2a/',
        component: ComponentCreator('/docs/app-dev/a2a/', '47a'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-actor/generate',
        component: ComponentCreator('/docs/app-dev/create-actor/generate', 'a85'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-actor/run',
        component: ComponentCreator('/docs/app-dev/create-actor/run', '980'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-actor/test',
        component: ComponentCreator('/docs/app-dev/create-actor/test', '87a'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-actor/update',
        component: ComponentCreator('/docs/app-dev/create-actor/update', 'a3e'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-provider/',
        component: ComponentCreator('/docs/app-dev/create-provider/', '2f3'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-provider/consuming',
        component: ComponentCreator('/docs/app-dev/create-provider/consuming', '699'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-provider/create-par',
        component: ComponentCreator('/docs/app-dev/create-provider/create-par', '162'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-provider/new-interface',
        component: ComponentCreator('/docs/app-dev/create-provider/new-interface', 'dbe'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-provider/rust',
        component: ComponentCreator('/docs/app-dev/create-provider/rust', '7a4'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/create-provider/testing',
        component: ComponentCreator('/docs/app-dev/create-provider/testing', 'd1e'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/debugging/actors.en',
        component: ComponentCreator('/docs/app-dev/debugging/actors.en', 'f23'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/debugging/host.en',
        component: ComponentCreator('/docs/app-dev/debugging/host.en', '628'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/debugging/providers.en',
        component: ComponentCreator('/docs/app-dev/debugging/providers.en', '114'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/secure/clusterkeys',
        component: ComponentCreator('/docs/app-dev/secure/clusterkeys', '839'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/secure/env',
        component: ComponentCreator('/docs/app-dev/secure/env', '047'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/secure/nats',
        component: ComponentCreator('/docs/app-dev/secure/nats', 'bcd'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/workflow/',
        component: ComponentCreator('/docs/app-dev/workflow/', 'd36'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/app-dev/workflow/tracing.en',
        component: ComponentCreator('/docs/app-dev/workflow/tracing.en', '8a7'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/category/app-development',
        component: ComponentCreator('/docs/category/app-development', '0f8'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/category/bindle',
        component: ComponentCreator('/docs/category/bindle', '729'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/category/host-runtime',
        component: ComponentCreator('/docs/category/host-runtime', '271'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/category/reference',
        component: ComponentCreator('/docs/category/reference', '641'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/getting-started',
        component: ComponentCreator('/docs/getting-started', 'a25'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/installation',
        component: ComponentCreator('/docs/installation', 'd4c'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/',
        component: ComponentCreator('/docs/interfaces/', '910'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/code-generation',
        component: ComponentCreator('/docs/interfaces/code-generation', '87c'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/codegen-toml',
        component: ComponentCreator('/docs/interfaces/codegen-toml', 'a3a'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/crates-io',
        component: ComponentCreator('/docs/interfaces/crates-io', '443'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/tips/',
        component: ComponentCreator('/docs/interfaces/tips/', '50d'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/tips/avoid-single-member-structures',
        component: ComponentCreator('/docs/interfaces/tips/avoid-single-member-structures', '511'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/tips/clippy-warnings',
        component: ComponentCreator('/docs/interfaces/tips/clippy-warnings', '4a8'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/tips/error-messages',
        component: ComponentCreator('/docs/interfaces/tips/error-messages', 'a73'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/tips/lint-validate',
        component: ComponentCreator('/docs/interfaces/tips/lint-validate', '722'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/traits',
        component: ComponentCreator('/docs/interfaces/traits', 'de2'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/interfaces/wasmcloud-smithy',
        component: ComponentCreator('/docs/interfaces/wasmcloud-smithy', 'f66'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/intro',
        component: ComponentCreator('/docs/intro', '5ba'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/overview/installation/install-with-docker',
        component: ComponentCreator('/docs/overview/installation/install-with-docker', 'bfd'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/overview/installation/manual-install',
        component: ComponentCreator('/docs/overview/installation/manual-install', 'f82'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/platform-builder/',
        component: ComponentCreator('/docs/platform-builder/', '29b'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/platform-builder/custom-host/fromspec',
        component: ComponentCreator('/docs/platform-builder/custom-host/fromspec', '142'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/platform-builder/oci/',
        component: ComponentCreator('/docs/platform-builder/oci/', '9a0'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/bindle/actor-bindles',
        component: ComponentCreator('/docs/reference/bindle/actor-bindles', 'd69'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/bindle/provider-bindles',
        component: ComponentCreator('/docs/reference/bindle/provider-bindles', 'a11'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/bindle/using-bindles',
        component: ComponentCreator('/docs/reference/bindle/using-bindles', 'cc6'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/',
        component: ComponentCreator('/docs/reference/host-runtime/', '3f9'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/actors',
        component: ComponentCreator('/docs/reference/host-runtime/actors', '02b'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/architecture',
        component: ComponentCreator('/docs/reference/host-runtime/architecture', '732'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/capabilities',
        component: ComponentCreator('/docs/reference/host-runtime/capabilities', '15e'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/healthchecks',
        component: ComponentCreator('/docs/reference/host-runtime/healthchecks', 'fce'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/host_configure',
        component: ComponentCreator('/docs/reference/host-runtime/host_configure', '041'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/links',
        component: ComponentCreator('/docs/reference/host-runtime/links', 'c6f'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/manifest',
        component: ComponentCreator('/docs/reference/host-runtime/manifest', '676'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/provider-archive',
        component: ComponentCreator('/docs/reference/host-runtime/provider-archive', '551'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/running',
        component: ComponentCreator('/docs/reference/host-runtime/running', 'f37'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/safeshutdown',
        component: ComponentCreator('/docs/reference/host-runtime/safeshutdown', '03d'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/host-runtime/security',
        component: ComponentCreator('/docs/reference/host-runtime/security', '5ba'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice-protocols/',
        component: ComponentCreator('/docs/reference/lattice-protocols/', '3eb'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice-protocols/control-interface',
        component: ComponentCreator('/docs/reference/lattice-protocols/control-interface', '987'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice-protocols/prefix',
        component: ComponentCreator('/docs/reference/lattice-protocols/prefix', '9ea'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice-protocols/rpc',
        component: ComponentCreator('/docs/reference/lattice-protocols/rpc', 'e38'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice/',
        component: ComponentCreator('/docs/reference/lattice/', '1e8'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice/auctions',
        component: ComponentCreator('/docs/reference/lattice/auctions', 'e8f'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice/jetstream',
        component: ComponentCreator('/docs/reference/lattice/jetstream', '1eb'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice/js_leaf',
        component: ComponentCreator('/docs/reference/lattice/js_leaf', 'd45'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice/leaf-nodes',
        component: ComponentCreator('/docs/reference/lattice/leaf-nodes', '0dc'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice/ngs',
        component: ComponentCreator('/docs/reference/lattice/ngs', '48e'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice/provision',
        component: ComponentCreator('/docs/reference/lattice/provision', '2f6'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/lattice/security-patterns',
        component: ComponentCreator('/docs/reference/lattice/security-patterns', '5ea'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/wadm/api',
        component: ComponentCreator('/docs/reference/wadm/api', 'b61'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/wadm/install',
        component: ComponentCreator('/docs/reference/wadm/install', '876'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/wadm/model',
        component: ComponentCreator('/docs/reference/wadm/model', 'a8a'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/wadm/usage',
        component: ComponentCreator('/docs/reference/wadm/usage', 'ff6'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/wash/',
        component: ComponentCreator('/docs/reference/wash/', '909'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/wash/contexts',
        component: ComponentCreator('/docs/reference/wash/contexts', 'c7d'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/wasmbus/',
        component: ComponentCreator('/docs/reference/wasmbus/', '847'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/wasmbus/ffi',
        component: ComponentCreator('/docs/reference/wasmbus/ffi', '14b'),
        exact: true,
        sidebar: "defaultSidebar"
      },
      {
        path: '/docs/reference/wasmbus/protocol',
        component: ComponentCreator('/docs/reference/wasmbus/protocol', 'e58'),
        exact: true,
        sidebar: "defaultSidebar"
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '35b'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
