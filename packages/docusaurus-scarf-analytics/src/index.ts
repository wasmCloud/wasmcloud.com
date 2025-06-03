import { Plugin, LoadContext } from '@docusaurus/types';
import { getPluginName } from '@wasmcloud/docusaurus-helpers';

import { PluginOptions } from './options';

const PLUGIN_NAME = getPluginName(__dirname);

export default async function docusaurusChecks(
  context: LoadContext,
  options: PluginOptions,
): Promise<Plugin<void>> {
  return {
    name: PLUGIN_NAME,
    injectHtmlTags() {
      return {
        preBodyTags: [
          {
            tagName: 'img',
            attributes: {
              src: `https://static.scarf.sh/a.png?x-pxid=${options.pixelId}`,
              alt: '',
              style: [
                'display:block',
                'position:absolute',
                'top:0',
                'left:0',
                'width:1px',
                'height:1px',
                'pointer-events:none',
              ].join(';'),
              referrerpolicy: 'no-referrer-when-downgrade',
            },
          },
        ],
      };
    },
  };
}

export { validateOptions, type Options } from './options';
