import { Plugin } from '@docusaurus/types';
import rootLogger from '../utils/logger';
import { PluginOptions } from '../options';

export type CheckLevel = 'error' | 'warn' | 'off';

export type BuildContext = Parameters<Required<Plugin>['postBuild']>[0];

export type DefaultCheckOptions<T = {}> = {
  level: CheckLevel;
} & T;

export type Check<Options, Name> = (rootOptions: PluginOptions) => {
  name: Name;
  options: Options;
  run: (context: BuildContext) => Promise<void>;
};

type RunContext = {
  buildContext: BuildContext;
  logger: typeof rootLogger;
  fail: (message: string) => void;
};

export type GenerateCheckOptions<Options> = {
  run(context: RunContext, options: Options): Promise<void>;
};

export default function generateCheck<Options extends DefaultCheckOptions, Name extends string>(
  name: Name,
  check: GenerateCheckOptions<Options>,
): Check<Options, Name> {
  return (rootOptions) => {
    const logger = rootLogger.checkLogger(name);
    const options = rootOptions[name] as Options;
    const fail = options.level === 'error' ? logger.throw : logger.warn;

    return {
      name: name,
      options,
      async run(buildContext: BuildContext) {
        if (options.level === 'off') return;
        const context = { buildContext, logger, fail };
        check.run(context, options);
      },
    };
  };
}
