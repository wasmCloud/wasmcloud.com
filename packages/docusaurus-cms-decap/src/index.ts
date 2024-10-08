import fs from 'node:fs/promises';
import nodePath from 'node:path';
import { Plugin, LoadContext } from '@docusaurus/types';
import { PLUGIN_NAME } from './utils/constants';
import { CmsConfig, PluginOptions } from './options';
import { loadConfig } from './utils/loadConfig';
import logger from './utils/logger';

export type AdminProps = {
  config: CmsConfig;
};

export default async function docusaurusChecks(
  context: LoadContext,
  options: PluginOptions,
): Promise<Plugin<void>> {
  const { path, config } = options;
  const fullConfigPath =
    typeof config === 'string' ? nodePath.resolve(context.siteDir, config) : undefined;

  const srcDirectory = nodePath.resolve(__dirname, '..', 'src');
  const themeDirectory = nodePath.resolve(srcDirectory, 'client/theme');

  return {
    name: PLUGIN_NAME,

    getThemePath() {
      return themeDirectory;
    },

    getTypeScriptThemePath() {
      return nodePath.resolve(themeDirectory);
    },

    getPathsToWatch() {
      logger.log(`CMS Config: ${fullConfigPath}`);
      return [...(fullConfigPath ? [fullConfigPath] : [])];
    },

    async contentLoaded({ actions }) {
      const parsedConfig =
        typeof fullConfigPath === 'string'
          ? await loadConfig(fullConfigPath)
          : await loadConfig(config);

      const storedConfigJson = await actions.createData(
        'config.json',
        JSON.stringify(parsedConfig),
      );

      actions.addRoute({
        component: nodePath.resolve(themeDirectory, 'Admin/index.tsx'),
        exact: true,
        path,
        modules: {
          config: storedConfigJson,
        },
      });

      logger.log(`CMS config reloaded. Admin UI available at: ${options.path}`);
    },
  };
}

export { validateOptions, type Options } from './options';
