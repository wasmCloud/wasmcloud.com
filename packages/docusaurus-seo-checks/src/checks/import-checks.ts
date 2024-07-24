import { PluginOptions } from '../options';

function importChecks(options: PluginOptions) {
  return [
    // all checks here
    import('./underscores'),
  ].map(async (module) => (await module).default(options));
}

type ImportedChecks = Awaited<Awaited<ReturnType<typeof importChecks>>[number]>;

export type ImportedChecksOptions = {
  [K in ImportedChecks['name']]: Extract<ImportedChecks, { name: K }>['options'];
};

export default importChecks;
