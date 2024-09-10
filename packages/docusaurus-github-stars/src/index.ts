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
      const octokit = new Octokit();
      const response = await octokit.repos.get({ owner, repo });
      if (response.status !== 200) {
        logger.report('throw')(`Failed to fetch repo data for ${options.preloadRepo}`);
      }
      return response.data;
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
