import fs from 'node:fs';

function getPluginName() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  return packageJson.name;
}

export const PLUGIN_NAME = getPluginName();
