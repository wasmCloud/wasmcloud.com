import { Joi } from '@docusaurus/utils-validation';
import type { OptionValidationContext } from '@docusaurus/types';

type Options = { pixelId: string };
type PluginOptions = Options;

const schema = Joi.object({
  pixelId: Joi.string().description('The Pixel ID to use for Scarf tracking').required(),
});

function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  return validate(schema, options);
}

export { type Options, type PluginOptions, validateOptions };
