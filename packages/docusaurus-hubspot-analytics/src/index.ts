import { ResolvedOptions } from './options';
import { LoadContext } from '@docusaurus/types';
import { getPluginName } from '@wasmcloud/docusaurus-helpers';

export const PLUGIN_NAME = getPluginName(__dirname);

export default async function githubStars(
  context: LoadContext,
  { enabledInDevelopment, hubspotId, region, pluginContentTypes }: ResolvedOptions,
) {
  const isInDevelopment = false && process.env.NODE_ENV === 'development';
  const isDeployPreview = process.env.NETLIFY && process.env.CONTEXT === 'deploy-preview';

  return {
    name: PLUGIN_NAME,
    injectHtmlTags: () => {
      if (isDeployPreview) return {};

      if (isInDevelopment && enabledInDevelopment === false) {
        return {
          headTags: [
            {
              tagName: 'script',
              attributes: {
                type: 'text/javascript',
              },
              innerHTML: `console.log('HubSpot tracking disabled in development')`,
            },
          ],
        };
      }

      return {
        headTags: [
          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
              id: 'hs-script-loader',
              src: `//js.hs-scripts.com/${hubspotId}.js`,
              async: true,
              defer: true,
            },
          },
          {
            tagName: 'script',
            attributes: {
              type: 'text/javascript',
            },
            innerHTML: `
              window.pluginHubspotAnalytics = window.pluginHubspotAnalytics || [];
              ${pluginContentTypes
                .map(([pluginFilter, contentType]) => {
                  const pluginString = JSON.stringify(pluginFilter);
                  return `window.pluginHubspotAnalytics.push([${pluginString}, '${contentType}']);`;
                })
                .join('\n')}
            `,
          },
        ],
      };
    },
    getClientModules() {
      return [require.resolve('./client/update-hs-content-types')];
    },
  };
}

export { validateOptions, type Options } from './options';
