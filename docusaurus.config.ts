import { Config } from '@docusaurus/types';
import {
  Options as PresetClassicOptions,
  ThemeConfig as PresetClassicThemeConfig,
} from '@docusaurus/preset-classic';
import { Options as PluginContentBlogOptions } from '@docusaurus/plugin-content-blog';
import { Options as PluginGoogleAnalyticsOptions } from '@docusaurus/plugin-google-analytics';
import { themes } from 'prism-react-renderer';

const config: Config = {
  title: 'wasmCloud',
  tagline: 'Build applications in any language and deploy them anywhere.',
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
        },
        docs: {
          editUrl: 'https://github.com/wasmCloud/wasmcloud.com-dev/edit/main/',
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
      } satisfies PluginContentBlogOptions,
    ],
    [
      '@docusaurus/plugin-google-analytics',
      {
        trackingID: process.env.GOOGLE_ANALYTICS_ID || 'localdev',
        anonymizeIP: true,
      } as PluginGoogleAnalyticsOptions,
    ],
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
    prism: {
      additionalLanguages: ['rust', 'powershell', 'toml', 'elixir'],
      theme: themes.dracula,
      darkTheme: themes.dracula,
    },
  } satisfies PresetClassicThemeConfig,

  markdown: {
    format: 'detect',
    mdx1Compat: {
      admonitions: false,
      comments: false,
      headingIds: false,
    }
  }
};

module.exports = config;
