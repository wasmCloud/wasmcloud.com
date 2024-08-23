import { PLUGIN_NAME } from './constants';
import { logger as loggerHelper } from '@wasmcloud/docusaurus-helpers';

function logger(name?: string) {
  const loggerName = name ? `${PLUGIN_NAME}:${name}` : PLUGIN_NAME;

  return {
    /**
     * Returns a logger with the provided check name.
     * @param checkName the name of the check
     * @returns a logger with the check name
     */
    checkLogger(checkName: string) {
      return logger(checkName);
    },

    ...loggerHelper(loggerName),
  };
}

const rootLogger = logger();

export default rootLogger;
