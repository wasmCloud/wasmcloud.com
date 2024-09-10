import { Joi } from '@docusaurus/utils-validation';
import type { OptionValidationContext } from '@docusaurus/types';
import { CheckLevel, DefaultCheckOptions } from './checks/generate-check';
import { ImportedChecksOptions } from './checks/import-checks';

type Options = ImportedChecksOptions;

type PluginOptions = Record<string, DefaultCheckOptions>;

function defaultBooleanToLevel(value: boolean | { level: CheckLevel } | undefined): {
  level: CheckLevel;
} {
  if (typeof value === 'boolean') {
    return { level: value ? 'error' : 'off' };
  }
  return value ?? { level: 'error' };
}

const UnderscoresSchema = Joi.alternatives()
  .try(
    Joi.boolean(),
    Joi.object({
      level: Joi.string().valid('error', 'warn', 'off'),
    }),
  )
  .custom(defaultBooleanToLevel);

const schema = Joi.object({
  underscores: UnderscoresSchema,
});

function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  return validate(schema, options);
}

export { type DefaultCheckOptions, type Options, type PluginOptions, validateOptions };
