import { Plugin, LoadContext } from '@docusaurus/types';
import { getPluginName } from '@wasmcloud/docusaurus-helpers';

import { PluginOptions } from './options';

const PLUGIN_NAME = getPluginName(__dirname);

export default async function reoAnalytics(
  _context: LoadContext,
  options: PluginOptions,
): Promise<Plugin<void>> {
  return {
    name: PLUGIN_NAME,
    injectHtmlTags() {
      return {
        preBodyTags: [
          {
            tagName: 'script',
            attributes: {
              src: `https://static.reo.dev/${options.clientID}/reo.js`,
              defer: true,
              onload: `Reo.init({ clientID: "${options.clientID}" })`,
            },
          },
        ],
      };
    },
  };
}

export { validateOptions, type Options } from './options';
