import { Joi } from '@docusaurus/utils-validation';
import type { OptionValidationContext } from '@docusaurus/types';

type HsContentType = 'site-page' | 'landing-page' | 'blog-post' | 'knowledge-article';
type PluginFilter = { id?: string; plugin: string };

type Options = {
  hubspotId: string;
  region?: string;
  enabledInDevelopment?: boolean;
  pluginContentTypes?: [PluginFilter, HsContentType][];
};

type ResolvedOptions = {
  hubspotId: string;
  region?: string;
  enabledInDevelopment: boolean;
  pluginContentTypes: [PluginFilter, HsContentType][];
};

const schema = Joi.object({
  hubspotId: Joi.string().required(),
  region: Joi.string().default('na1'),
  enabledInDevelopment: Joi.boolean().default(false),
  pluginContentTypes: Joi.array()
    .items(
      Joi.array().ordered(
        Joi.object({
          id: Joi.string().optional(),
          plugin: Joi.string().required(),
        }),
        Joi.string()
          .valid('site-page', 'landing-page', 'blog-post', 'knowledge-article')
          .required(),
      ),
    )
    .default([
      [{ plugin: 'blog' }, 'blog-post'],
      [{ plugin: 'pages' }, 'site-page'],
      [{ plugin: 'docs' }, 'knowledge-article'],
    ]),
});

function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, ResolvedOptions>): ResolvedOptions {
  return validate(schema, options);
}

export { type Options, type ResolvedOptions, validateOptions };
