import { PluginOptions } from './options';
import { Plugin, LoadContext } from '@docusaurus/types';
import rootLogger from './utils/logger';
import { PLUGIN_NAME } from './utils/constants';
import importChecks from './checks/import-checks';

export default async function docusaurusChecks(
  context: LoadContext,
  options: PluginOptions,
): Promise<Plugin<void>> {
  const checks = await importChecks(options);

  return {
    name: PLUGIN_NAME,
    async postBuild(context) {
      rootLogger.log('Running post-build checks');
      for await (const check of checks) {
        await check.run(context);
      }
    },
  };
}

export { validateOptions, type Options, type DefaultCheckOptions } from './options';
