import { packageUpSync } from 'package-up';

function getPluginName(cwd: string) {
  if (!cwd) throw new Error('No cwd provided to getPluginName.');
  const packageStr = packageUpSync({ cwd });
  if (!packageStr) throw new Error('Could not find package.json');
  return require(packageStr).name;
}

export { getPluginName };
