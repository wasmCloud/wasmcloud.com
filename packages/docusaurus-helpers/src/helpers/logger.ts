import docusaurusLogger from '@docusaurus/logger';
import terminalLink from 'terminal-link';

function logger(name?: string) {
  const PREFIX = docusaurusLogger.bold(name ? `[${name}]` : '');

  function format(message: string) {
    const multiline: boolean = message.includes('\n');
    return `${PREFIX}${multiline ? '\n' : ' '}${message}`;
  }

  return {
    log(message: string) {
      docusaurusLogger.report('log')(format(message));
    },

    warn(message: string) {
      docusaurusLogger.warn(format(message));
      docusaurusLogger.report('warn')(`SEO Check failed: ${name}`);
    },

    throw(message: string) {
      docusaurusLogger.error(format(message));
      docusaurusLogger.report('throw')(`SEO Check failed: ${name}`);
    },

    /**
     * Interpolates a template string with the provided values.
     * @param files array of file paths
     * @returns multiline string with each file path prefixed with 'path='
     */
    formatFiles(files: string[]) {
      return docusaurusLogger.interpolate`path=${files}`;
    },

    /**
     * format a string as a link that can be clicked in the terminal
     * @param text
     * @param url
     * @returns a string that can be clicked in the terminal
     */
    formatLink(text: string, url: string) {
      return terminalLink(text, url);
    },
  };
}

export { logger };
