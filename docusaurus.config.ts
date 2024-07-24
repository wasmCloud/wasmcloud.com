import fs from 'node:fs/promises';
import { Config } from '@docusaurus/types';
import {
  Options as PresetClassicOptions,
  ThemeConfig as PresetClassicThemeConfig,
} from '@docusaurus/preset-classic';
import { Options as PluginContentBlogOptions } from '@docusaurus/plugin-content-blog';
import { Options as PluginGoogleAnalyticsOptions } from '@docusaurus/plugin-google-analytics';
import rehypeShiki, { RehypeShikiOptions } from '@shikijs/rehype';
import { bundledLanguages } from 'shiki';
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
} from '@shikijs/transformers';
import rehypeNameToId from 'rehype-name-to-id';

const rehypeShikiPlugin = [
  rehypeShiki,
  {
    themes: {
      dark: 'github-dark',
      light: 'github-light',
    },
    transformers: [
      {
        name: 'meta',
        code(node) {
          const language = this.options.lang ?? 'plaintext';
          this.addClassToHast(node, `language-${language}`);
          return node;
        },
      },
      transformerMetaHighlight(),
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerNotationFocus(),
    ],
    langs: [
      ...(Object.keys(bundledLanguages) as Array<keyof typeof bundledLanguages>),
      async () => JSON.parse(await fs.readFile('./languages/wit.tmLanguage.json', 'utf-8')),
      async () => JSON.parse(await fs.readFile('./languages/smithy.tmLanguage.json', 'utf-8')),
    ],
  } as RehypeShikiOptions,
];

const config: Config = {
  title: 'wasmCloud',
  tagline: 'Build applications in any language. Deploy them anywhere.',
  customFields: {
    description: 'The secure, distributed, WebAssembly application platform',
    tagline_1: 'Build applications in any language.',
    tagline_2: 'Deploy them anywhere.',
  },
  url: 'https://wasmcloud.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  // Hubspot
  scripts: [
    {
      src: `//js.hs-scripts.com/${process.env.HUBSPOT_ID}.js`,
      defer: true,
      async: true,
    },
  ],

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        blog: {
          blogSidebarCount: 100,
          beforeDefaultRehypePlugins: [rehypeShikiPlugin],
          rehypePlugins: [rehypeNameToId],
          authorsMapPath: 'authors.yml',
        },
        docs: {
          editUrl: 'https://github.com/wasmCloud/wasmcloud.com/edit/main/',
          beforeDefaultRehypePlugins: [rehypeShikiPlugin],
          rehypePlugins: [rehypeNameToId],
          lastVersion: 'current',
          versions: {
            current: {
              label: '1.0',
            },
            0.82: {
              label: '0.82',
              path: '0.82',
              banner: 'unmaintained',
            },
          },
        },
        pages: {
          beforeDefaultRehypePlugins: [rehypeShikiPlugin],
          rehypePlugins: [rehypeNameToId],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies PresetClassicOptions,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'community',
        routeBasePath: 'community',
        path: './community',
        showReadingTime: false,
        editUrl: 'https://github.com/wasmCloud/wasmcloud.com-dev/edit/main/',
        blogSidebarCount: 100,
        blogTitle: 'wasmCloud Community Content',
        blogDescription: 'wasmCloud community meetings agendas, notes, and recordings',
        blogSidebarTitle: 'Community Meetings',
        beforeDefaultRehypePlugins: [rehypeShikiPlugin],
        rehypePlugins: [rehypeNameToId],
      } satisfies PluginContentBlogOptions,
    ],
    [
      '@docusaurus/plugin-google-analytics',
      {
        trackingID: process.env.GOOGLE_ANALYTICS_ID || 'localdev',
        anonymizeIP: true,
      } as PluginGoogleAnalyticsOptions,
    ],
    customPostCssPlugin, // PostCSS plugin function registration
  ],

  themeConfig: {
    image: 'img/wasmcloud_large_social.png',
    navbar: {
      title: 'wasmCloud',
      logo: {
        alt: 'wasmCloud Logo',
        src: 'img/wasmcloud_green.svg',
      },
      items: [
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/community', label: 'Community', position: 'left' },
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'docsVersionDropdown',
        },
        {
          href: 'https://ostif.org/ostif-has-completed-a-security-audit-of-wasmcloud/',
          label: 'Security Assessment',
          position: 'right',
        },
        {
          href: 'https://github.com/wasmcloud',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    announcementBar: {
      id: '1.0',
      content: `🎉️ <b>wasmCloud v1.0</b> is available! Read the <a href="/docs/intro">1.0 documentation</a> and try it out now.`,
      backgroundColor: '#20232a',
      textColor: '#fff',
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/wasmcloud/',
            },
            {
              label: 'Contributing',
              href: 'https://github.com/wasmCloud/wasmCloud/blob/main/CONTRIBUTING.md',
            },
            {
              label: 'Slack',
              href: 'https://slack.wasmcloud.com',
            },
            {
              label: 'Calendar & wasmCloud Wednesdays',
              href: 'https://calendar.google.com/calendar/u/0/embed?src=c_6cm5hud8evuns4pe5ggu3h9qrs@group.calendar.google.com',
            },
            {
              label: 'Community Meeting Notes',
              to: '/community',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Twitter',
              href: 'https://twitter.com/wasmcloud',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/company/wasmCloud/',
            },
            {
              label: 'YouTube',
              href: 'https://www.youtube.com/wasmcloud',
            },
          ],
        },
        {
          title: 'Legal & Mail',
          items: [
            {
              label: 'Privacy Policy',
              to: '/privacy-policy',
            },
            {
              label: 'Terms and Conditions',
              to: '/terms-conditions',
            },
            {
              label: 'Contact & Mailing List',
              to: '/contact',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} wasmCloud LLC. All rights reserved. The Linux Foundation has registered trademarks and uses trademarks. For a list of trademarks of The Linux Foundation, please see our Trademark Usage page: https://www.linuxfoundation.org/trademark-usage. Built with Docusaurus.`,
    },
    algolia: {
      apiKey: 'f0ef30f3d98ce5e9a7dd7579bb221dfc',
      indexName: 'wasmcloud',
      appId: '2IM4TMH501',
    },
  } satisfies PresetClassicThemeConfig,

  markdown: {
    format: 'detect',
    mdx1Compat: {
      admonitions: false,
      comments: false,
      headingIds: false,
    },
  },

  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',
};

/** @return {import('@docusaurus/types').Plugin} */
function customPostCssPlugin() {
  return {
    name: 'custom-postcss',
    configurePostCss(options) {
      // Append new PostCSS plugins here.
      options.plugins.push(require('postcss-preset-env')); // allow newest CSS syntax
      return options;
    },
  };
}

module.exports = config;
