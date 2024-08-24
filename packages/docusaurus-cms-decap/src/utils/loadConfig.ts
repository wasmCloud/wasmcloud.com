import fs from 'node:fs/promises';
import { CmsConfig } from '../options';
import { load as loadYaml } from 'js-yaml';
import logger from './logger';

async function loadConfig(config: CmsConfig | string): Promise<CmsConfig> {
  if (typeof config === 'object') {
    return config;
  }
  try {
    const contents = await fs.readFile(config, 'utf-8');
    const parsedConfig = loadYaml(contents) as CmsConfig;

    if (!parsedConfig) throw new Error('No CMS configuration found');

    return parsedConfig;
  } catch (e) {
    if (e instanceof Error && e.message) {
      logger.throw(e.message);
    } else {
      logger.throw('An error occurred while loading the CMS configuration');
    }
    process.exit(1);
  }
}

export { loadConfig };
