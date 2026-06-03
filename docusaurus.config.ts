import fs from 'node:fs/promises';
import { Config } from '@docusaurus/types';
import {
  Options as PresetClassicOptions,
  ThemeConfig as PresetClassicThemeConfig,
} from '@docusaurus/preset-classic';
import { Options as PluginContentBlogOptions } from '@docusaurus/plugin-content-blog';
import { Options as PluginGoogleAnalyticsOptions } from '@docusaurus/plugin-google-analytics';
import { Options as PluginGithubStarsOptions } from '@wasmcloud/docusaurus-github-stars';
import { Options as PluginHubspotAnalyticsOptions } from '@wasmcloud/docusaurus-hubspot-analytics';
import { Options as PluginReoAnalyticsOptions } from '@wasmcloud/docusaurus-reo-analytics';
import { Options as PluginSEOChecksOptions } from '@wasmcloud/docusaurus-seo-checks';
import communitySpeakersPlugin from './plugins/community-speakers';
import rehypeShiki, { RehypeShikiOptions } from '@shikijs/rehype';
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
} from '@shikijs/transformers';
import rehypeNameToId from 'rehype-name-to-id';
import { WASMCLOUD_VERSION } from './src/wasmcloud-version';
import wasmCloudVersionPlugin from './src/remark/wasmcloud-version';

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
  } as RehypeShikiOptions,
];

function siteBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  if (
    process.env.NETLIFY &&
    process.env.CONTEXT === 'deploy-preview' &&
    process.env.DEPLOY_PRIME_URL
  ) {
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
    future: {
      experimental_faster: true,
      v4: true,
    },
    url: siteBaseUrl(),
    baseUrl: '/',
    trailingSlash: true,
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
            onInlineAuthors: 'throw',
            onUntruncatedBlogPosts: 'ignore',
            // M1 — populate metadata.lastUpdatedAt + lastUpdatedBy from git so
            // downstream Article schema can emit dateModified accurately.
            showLastUpdateTime: true,
            showLastUpdateAuthor: true,
          },
          docs: {
            sidebarPath: require.resolve('./sidebars.js'),
            editUrl: 'https://github.com/wasmCloud/wasmcloud.com/edit/main/',
            remarkPlugins: [[wasmCloudVersionPlugin, { version: WASMCLOUD_VERSION }]],
            beforeDefaultRehypePlugins: [rehypeShikiPlugin],
            rehypePlugins: [rehypeNameToId],
            // M1 — same as blog: drives TechArticle.dateModified
            showLastUpdateTime: true,
            showLastUpdateAuthor: true,
            lastVersion: 'current',
            versions: {
              current: {
                label: 'v2',
              },
              v1: {
                label: 'v1',
                path: 'v1',
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
          sitemap: {
            changefreq: 'weekly',
            priority: 0.5,
            filename: 'sitemap.xml',
            createSitemapItems: async (params) => {
              const { defaultCreateSitemapItems, ...rest } = params;
              const items = await defaultCreateSitemapItems(rest);
              const COMMUNITY_YEAR_RE = /^\/community\/(\d{4})[-/]/;
              // Low-value utility / auto-generated pages with no SEO value — keep out of the sitemap
              const SITEMAP_DROP_EXACT = new Set([
                '/search/',
                '/blog/authors/',
                '/blog/archive/',
                '/community/authors/',
                '/community/archive/',
                '/gather/',
                '/feedback/backstage/',
              ]);
              return items.flatMap((item) => {
                // Use pathname so priorities work on deploy previews too
                const path = new URL(item.url).pathname;

                const normPath = path.endsWith('/') ? path : `${path}/`;
                if (
                  SITEMAP_DROP_EXACT.has(normPath) ||
                  normPath.startsWith('/blog/authors/') ||
                  normPath.startsWith('/community/authors/')
                ) {
                  return [];
                }

                // Community meeting/transcript dated content:
                //   2026 → priority 0.9 (current cadence)
                //   2025 → priority 0.8 (indexed; content-rich backfilled pages)
                //   pre-2025 → noindex (handled in CommunityPostPage swizzle); drop from sitemap
                const communityYearMatch = path.match(COMMUNITY_YEAR_RE);
                if (communityYearMatch) {
                  const year = Number(communityYearMatch[1]);
                  if (year >= 2026) {
                    return [{ ...item, priority: 0.9, changefreq: 'monthly' }];
                  }
                  if (year >= 2025) {
                    return [{ ...item, priority: 0.8, changefreq: 'yearly' }];
                  }
                  return [];
                }

                // Homepage — highest priority
                if (path === '/') {
                  return { ...item, priority: 1.0, changefreq: 'daily' };
                }

                // v2 docs (current, no version prefix) — high priority
                if (path.startsWith('/docs/') && !path.startsWith('/docs/v1/') && !path.startsWith('/docs/0.82/')) {
                  // Docs landing — top priority alongside homepage
                  if (path === '/docs/') {
                    return { ...item, priority: 1.0, changefreq: 'weekly' };
                  }
                  // SEO-critical: component model, kubernetes, quickstart, overview
                  if (
                    path.startsWith('/docs/quickstart/') ||
                    path.startsWith('/docs/overview/') ||
                    path.startsWith('/docs/kubernetes-operator/')
                  ) {
                    return { ...item, priority: 0.9, changefreq: 'weekly' };
                  }
                  return { ...item, priority: 0.8, changefreq: 'weekly' };
                }

                // Blog posts — high priority
                if (path.startsWith('/blog/') || path === '/blog/') {
                  if (path === '/blog/' || path === '/blog') {
                    return { ...item, priority: 0.8, changefreq: 'daily' };
                  }
                  if (path.startsWith('/blog/page/') || path.startsWith('/blog/tags/')) {
                    return { ...item, priority: 0.3, changefreq: 'weekly' };
                  }
                  return { ...item, priority: 0.7, changefreq: 'monthly' };
                }

                // Community meeting notes & transcripts
                if (path.startsWith('/community/') || path === '/community/') {
                  if (path === '/community/' || path === '/community') {
                    return { ...item, priority: 0.7, changefreq: 'monthly' };
                  }
                  // Pagination/tag archives — low priority
                  if (path.startsWith('/community/page/') || path.startsWith('/community/tags/')) {
                    return { ...item, priority: 0.3, changefreq: 'weekly' };
                  }
                  // Individual meeting notes & transcripts
                  return { ...item, priority: 0.5, changefreq: 'monthly' };
                }

                // v1 docs — archived
                if (path.startsWith('/docs/v1/')) {
                  return { ...item, priority: 0.3, changefreq: 'yearly' };
                }

                // 0.82 docs — already disallowed in robots.txt, minimal priority
                if (path.startsWith('/docs/0.82/')) {
                  return { ...item, priority: 0.1, changefreq: 'yearly' };
                }

                // Everything else (standalone pages like /contact, etc.)
                return { ...item, priority: 0.5, changefreq: 'monthly' };
              });
            },
          },
          theme: {
            customCss: [require.resolve('./src/styles/index.css')],
          },
        } satisfies PresetClassicOptions,
      ],
    ],

    plugins: [
      communitySpeakersPlugin,
      [
        '@wasmcloud/docusaurus-github-stars',
        {
          preloadRepo: process.env.NODE_ENV === 'production' ? 'wasmCloud/wasmCloud' : undefined,
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
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
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
      [
        '@wasmcloud/docusaurus-reo-analytics',
        {
          clientID: process.env.REO_CLIENT_ID || 'localdev',
        } satisfies PluginReoAnalyticsOptions,
      ],
      customPostCssPlugin, // PostCSS plugin function registration
      [
        'docusaurus-plugin-llms',
        {
          generateLlmsTxt: true,
          generateLlmsFullTxt: true,
          docsPluginIds: ['default'],
          blogPluginIds: ['default'],
        },
      ],
    ],

    themeConfig: {
      image: '/logo/wasmcloud-social.png',
      metadata: [
        { property: 'og:type', content: 'website' },
        { name: 'twitter:site', content: '@wasmcloud' },
      ],
      navbar: {
        title: 'wasmCloud',
        logo: {
          alt: 'wasmCloud Logo',
          src: '/logo/wasmcloud_green.svg',
        },
        items: [
          { to: '/blog', label: 'Blog', position: 'left' },
          { to: '/community', label: 'Community', position: 'left' },
          { type: 'doc', docId: 'index', position: 'left', label: 'Docs' },
          {
            type: 'docsVersionDropdown',
            // used for styling, see src/styles/theme/_navbar.css
            className: 'navbar__link--version-dropdown',
          },
          {
            href: 'https://github.com/wasmcloud/wasmcloud',
            'aria-label': 'Star wasmCloud on GitHub',
            position: 'right',
            html: `<span class="badge badge--outline">Star us! ★ <github-count repo="wasmcloud/wasmcloud">1500</github-count></span>`,
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
      // announcementBar: {
      //   id: 'announcement',
      //   content: `📢 Announcement content goes here.`,
      // },
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
        tagName: 'script',
        attributes: { type: 'application/ld+json' },
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': 'https://wasmcloud.com/#organization',
          name: 'wasmCloud',
          url: 'https://wasmcloud.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://wasmcloud.com/logo/wasmcloud_green.svg',
          },
          description:
            'wasmCloud is an open source CNCF project that enables teams to build, manage, and scale polyglot Wasm applications across any cloud, Kubernetes, or edge.',
          foundingDate: '2020',
          sameAs: [
            'https://github.com/wasmCloud',
            'https://twitter.com/wasmcloud',
            'https://www.linkedin.com/company/wasmCloud/',
            'https://www.youtube.com/wasmcloud',
            'https://www.cncf.io/projects/wasmcloud/',
          ],
        }),
      },
      {
        tagName: 'script',
        attributes: { type: 'application/ld+json' },
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': 'https://wasmcloud.com/#website',
          name: 'wasmCloud',
          url: 'https://wasmcloud.com',
          publisher: { '@id': 'https://wasmcloud.com/#organization' },
          inLanguage: 'en-US',
          // M1 — enables Google sitelinks searchbox in brand-search results.
          // Targets the Algolia DocSearch route which docusaurus serves at /search.
          // The URL is derived from siteBaseUrl() so deploy previews on
          // Netlify and local dev resolve to their own search endpoint rather
          // than silently posting against production.
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${siteBaseUrl()}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        }),
      },
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
