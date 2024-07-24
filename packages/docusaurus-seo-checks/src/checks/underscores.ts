import { stripIndents } from 'common-tags';
import generateCheck, { DefaultCheckOptions } from './generate-check';

export type UnderscoresCheckOptions = DefaultCheckOptions<{}>;

export default generateCheck('underscores' as const, {
  run: async ({ buildContext, logger, fail }, options: UnderscoresCheckOptions) => {
    const { routesPaths } = buildContext;

    const routesWithUnderscores = routesPaths.filter((route) => route.includes('_'));

    if (routesWithUnderscores.length > 0) {
      fail(
        stripIndents`
              Underscores in URLs are not recommended for SEO purposes (${logger.formatLink(
                'see reference here',
                'https://developers.google.com/search/docs/crawling-indexing/url-structure',
              )}).
              Please remove the underscores from the following paths/slugs and try again:
              ${logger.formatFiles(routesWithUnderscores)}
            `,
      );
    }
  },
});
