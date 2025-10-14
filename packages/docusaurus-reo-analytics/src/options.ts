import { Joi } from '@docusaurus/utils-validation';
import type { OptionValidationContext } from '@docusaurus/types';

type Options = { clientID: string };
type PluginOptions = Options;

const schema = Joi.object({
  clientID: Joi.string().description('The Client ID to use for Reo tracking').required(),
});

function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  return validate(schema, options);
}

export { type Options, type PluginOptions, validateOptions };
