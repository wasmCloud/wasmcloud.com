import { Joi } from '@docusaurus/utils-validation';
import type { OptionValidationContext } from '@docusaurus/types';
import { checkRepoId } from './utils/check-repo';

type Options = {
  /** allows the build to preload the star count with data instead of every page load */
  preloadRepo?: string;
};

type PluginOptions = {
  preloadRepo?: string;
};

const schema = Joi.object({
  preloadRepo: Joi.string().optional().custom(checkRepoId),
});

function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  return validate(schema, options);
}

export { type Options, type PluginOptions, validateOptions };
