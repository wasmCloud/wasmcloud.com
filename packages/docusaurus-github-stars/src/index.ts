import logger from '@docusaurus/logger';
import { LoadContext, Plugin } from '@docusaurus/types';
import { Octokit } from '@octokit/rest';
import { getPluginName } from '@wasmcloud/docusaurus-helpers';
import { PluginOptions } from './options';

export const PLUGIN_NAME = getPluginName(__dirname);

type RepoData = Awaited<ReturnType<Octokit['repos']['get']>>['data'];

export default async function githubStars(
  context: LoadContext,
  options: PluginOptions,
): Promise<Plugin<RepoData | undefined>> {
  return {
    name: PLUGIN_NAME,
    loadContent: async () => {
      if (!options.preloadRepo) {
        return;
      }
      const [owner, repo] = options.preloadRepo.split('/');
      // Authenticate when a token is available: anonymous requests share a
      // 60/hour limit per IP, which CI and Netlify build machines exhaust.
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      try {
        const response = await octokit.repos.get({ owner, repo });
        return response.data;
      } catch (err) {
        // Star counts are cosmetic: the client fetches them at runtime when
        // nothing was preloaded, so a GitHub failure shouldn't fail the build.
        logger.warn(`Failed to preload repo data for ${options.preloadRepo}: ${err}`);
        return undefined;
      }
    },
    injectHtmlTags: ({ content }) => {
      if (!content) return {};

      return {
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://www.github.com',
            },
          },
        ],
        postBodyTags: [
          {
            tagName: 'script',
            innerHTML: `
              window = window || {};
              window.docusaurusGithubStars = window.docusaurusGithubStars || []
              window.docusaurusGithubStars.push({
                repo: '${options.preloadRepo}',
                stars: ${content.stargazers_count},
                timestamp: ${Date.now()}
              });
            `,
          },
        ],
      };
    },
    getClientModules() {
      return [require.resolve('./client/custom-element.ts')];
    },
  };
}

export { validateOptions, type Options } from './options';
