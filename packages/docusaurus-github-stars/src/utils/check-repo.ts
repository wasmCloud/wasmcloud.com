import { type Joi } from '@docusaurus/utils-validation';

const checkRepoId: Joi.CustomValidator<string, string> = (value, helper) => {
  const [org, repo, ...rest] = value.split('/');
  if (!org || !repo || rest.length > 0) {
    return helper.error(`Invalid repo ID. Expected format: org/repo (received: ${value})`);
  }
  return value;
};

export { checkRepoId };
