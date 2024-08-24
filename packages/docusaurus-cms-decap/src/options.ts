import { Joi } from '@docusaurus/utils-validation';
import type { OptionValidationContext } from '@docusaurus/types';
import type { DecapCmsApp } from 'decap-cms-app';

type ComponentOptions = Parameters<typeof DecapCmsApp.registerEditorComponent>[0];

export type CmsConfig = Exclude<Parameters<typeof DecapCmsApp.init>[0], undefined>['config'];

type Options = {
  /**
   * Path to access the CMS admin UI
   * @default '/admin'
   */
  path?: string;
  /**
   * Path to the CMS configuration file, or the configuration object itself
   * @default './config.cms.yaml'
   */
  config?: CmsConfig | string;
  /**
   * Components to register with the CMS for display in the editor
   */
  registerComponents?: ComponentOptions[];
};

type PluginOptions = {
  path: string;
  config: CmsConfig | string;
  registerComponents?: ComponentOptions[];
};

const schema = Joi.object({
  path: Joi.string().default('/admin'),
  config: Joi.alternatives(Joi.object(), Joi.string()).default('./config.cms.yaml'),
  registerComponents: Joi.array().items(Joi.any()).optional(),
});

function validateOptions({
  validate,
  options,
}: OptionValidationContext<Options, PluginOptions>): PluginOptions {
  return validate(schema, options);
}

export { type Options, type PluginOptions, validateOptions };
