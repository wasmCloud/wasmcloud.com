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
    component: ComponentCreator('/docs', 'cba'),
    routes: [
      {
        path: '/docs/app-development/creating-an-actor',
        component: ComponentCreator('/docs/app-development/creating-an-actor', '9db'),
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
        path: '/docs/intro',
        component: ComponentCreator('/docs/intro', '5ba'),
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
