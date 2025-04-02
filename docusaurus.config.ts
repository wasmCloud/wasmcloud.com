import fs from 'node:fs/promises';
import { Config } from '@docusaurus/types';
import {
  Options as PresetClassicOptions,
  ThemeConfig as PresetClassicThemeConfig,
} from '@docusaurus/preset-classic';
import { Options as PluginContentBlogOptions } from '@docusaurus/plugin-content-blog';
import { Options as PluginGoogleAnalyticsOptions } from '@docusaurus/plugin-google-analytics';
import { Options as PluginSEOChecksOptions } from '@wasmcloud/docusaurus-seo-checks';
import { Options as PluginGithubStarsOptions } from '@wasmcloud/docusaurus-github-stars';
import { Options as PluginHubspotAnalyticsOptions } from '@wasmcloud/docusaurus-hubspot-analytics';
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

function siteBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  if (process.env.NETLIFY && process.env.CONTEXT === 'deploy-preview') {
    return process.env.DEPLOY_PRIME_URL;
  }
  return 'https://wasmcloud.com';
}

const config = (async (): Promise<Config> => {
  return {
    title: 'wasmCloud',
    tagline: 'Build applications in any language. Deploy them anywhere.',
    customFields: {
      description: 'The secure, distributed, WebAssembly application platform',
      tagline_1: 'Build applications in any language.',
      tagline_2: 'Deploy them anywhere.',
    },
    url: siteBaseUrl(),
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: '/favicon.ico',

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
            blogTitle: 'Blog',
            blogDescription: 'The latest wasmCloud news, updates, and announcements.',
            blogSidebarCount: 0,
            beforeDefaultRehypePlugins: [rehypeShikiPlugin],
            rehypePlugins: [rehypeNameToId],
            authorsMapPath: '../authors.yml', // relative to blog directory
            blogListComponent: '@theme/wasmcloud/blog/list-page',
            blogPostComponent: '@theme/wasmcloud/blog/post-page',
          },
          docs: {
            editUrl: 'https://github.com/wasmCloud/wasmcloud.com/edit/main/',
            beforeDefaultRehypePlugins: [rehypeShikiPlugin],
            rehypePlugins: [rehypeNameToId],
            lastVersion: 'current',
            versions: {
              current: {
                label: '1.x',
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
            customCss: [require.resolve('./src/styles/index.css')],
          },
        } satisfies PresetClassicOptions,
      ],
    ],

    plugins: [
      [
        '@wasmcloud/docusaurus-github-stars',
        {
          preloadRepo: 'wasmCloud/wasmCloud',
        } satisfies PluginGithubStarsOptions,
      ],
      [
        '@wasmcloud/docusaurus-seo-checks',
        {
          underscores: { level: 'error' },
        } satisfies PluginSEOChecksOptions,
      ],
      [
        '@docusaurus/plugin-content-blog',
        {
          id: 'community',
          routeBasePath: 'community',
          path: './community',
          showReadingTime: false,
          editUrl: 'https://github.com/wasmCloud/wasmcloud.com-dev/edit/main/',
          blogTitle: 'Community Calls',
          blogDescription: 'Weekly wasmCloud Wednesday agendas, notes, and recordings.',
          blogSidebarCount: 'ALL',
          blogSidebarTitle: 'Past Meetings',
          beforeDefaultRehypePlugins: [rehypeShikiPlugin],
          rehypePlugins: [rehypeNameToId],
          authorsMapPath: '../authors.yml', // relative to community directory
          blogListComponent: '@theme/wasmcloud/community/list-page',
          blogPostComponent: '@theme/wasmcloud/community/post-page',
        } satisfies PluginContentBlogOptions,
      ],
      [
        '@docusaurus/plugin-google-analytics',
        {
          trackingID: process.env.GOOGLE_ANALYTICS_ID || 'localdev',
          anonymizeIP: true,
        } satisfies PluginGoogleAnalyticsOptions,
      ],
      [
        '@wasmcloud/docusaurus-hubspot-analytics',
        {
          hubspotId: process.env.HUBSPOT_ID || 'localdev',
        } satisfies PluginHubspotAnalyticsOptions,
      ],
      customPostCssPlugin, // PostCSS plugin function registration
    ],

    themeConfig: {
      image: '/logo/wasmcloud-social.png',
      navbar: {
        title: 'wasmCloud',
        logo: {
          alt: 'wasmCloud Logo',
          src: '/logo/wasmcloud_green.svg',
        },
        items: [
          { to: '/blog', label: 'Blog', position: 'left' },
          { to: '/community', label: 'Community', position: 'left' },
          { type: 'doc', docId: 'intro', position: 'left', label: 'Docs' },
          {
            type: 'docsVersionDropdown',
            // used for styling, see src/styles/theme/_navbar.css
            className: 'navbar__link--version-dropdown',
          },
          {
            href: 'https://github.com/wasmcloud/wasmcloud',
            'aria-label': 'Star wasmCloud on GitHub',
            position: 'right',
            html: `<span class="badge badge--outline">Star us! ★ <github-count repo="wasmcloud/wasmcloud">1300</github-count></span>`,
            className: 'sidebar-hidden',
          },
          await svgIconNavItem({
            svgIconPath: './static/icons/github.svg',
            label: 'GitHub',
            href: 'https://github.com/wasmcloud/wasmcloud',
          }),
          await svgIconNavItem({
            svgIconPath: './static/icons/slack.svg',
            label: 'Slack',
            href: 'https://slack.wasmcloud.com/',
          }),
        ],
      },
//      announcementBar: {
//        id: 'announcement',
//        content: `📢 Announcement content goes here.`,
//      },
      footer: {
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
              }
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
            title: 'Organization',
            items: [
              {
                href: 'https://ostif.org/ostif-has-completed-a-security-audit-of-wasmcloud/',
                label: 'Security Assessment',
              },
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
              {
                label: 'wasmCloud Swag',
                to: '/swag',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} wasmCloud LLC. All rights reserved. The Linux Foundation has registered trademarks and uses trademarks. For a list of trademarks of The Linux Foundation, please see our Trademark Usage page: https://www.linuxfoundation.org/trademark-usage. Built with Docusaurus.`,
        scarf: `https://static.scarf.sh/a.png?x-pxid=c2e66ae7-621b-4451-8c30-36d2c33d804b`
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

    headTags: [
      {
        tagName: 'link',
        attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      },
      {
        tagName: 'link',
        attributes: {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'crossorigin',
        },
      },
      {
        tagName: 'link',
        attributes: {
          href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Lexend:wght@100..900&family=Inter:wght@100..900&display=swap',
          rel: 'stylesheet',
        },
      },
    ],

    onBrokenAnchors: 'throw',
    onDuplicateRoutes: 'throw',
  };
})();

/** @return {import('@docusaurus/types').Plugin} */
function customPostCssPlugin() {
  return {
    name: 'custom-postcss',
    configurePostCss(options) {
      options.plugins.push(require('postcss-preset-env'));
      return options;
    },
  };
}

type NavbarItem = Required<Required<PresetClassicThemeConfig>['navbar']>['items'][number];
type SvgNavItemOptions = NavbarItem & {
  svgIconPath: string;
  label: string;
  href: string;
  className?: string;
  position?: 'left' | 'right';
};
/**
 * build an icon nav item, works with styles in `src/styles/theme/_navbar.css`
 */
async function svgIconNavItem({
  svgIconPath,
  label,
  href,
  className,
  position = 'right',
  ...extras
}: SvgNavItemOptions): Promise<NavbarItem> {
  const icon = await fs.readFile(svgIconPath, 'utf-8');
  const linkClass = 'navbar__icon';

  return {
    href: href,
    position,
    html: `
      ${icon}
      <span class="navbar__icon-label">${label}</span>
    `,
    className: `${className ? `${className} ` : ''}${linkClass}`,
    ...extras,
  };
}

module.exports = config;
