import joi from '@hapi/joi';
import {
  uploadDocument,
  previewDocument,
  notifyEmail,
  skipToQuestion,
} from './behaviourValidator';

const behaviourValidators = new Map([
  ['UPLOAD_DOCUMENT', uploadDocument],
  ['PREVIEW_DOCUMENT', previewDocument],
  ['NOTIFY_EMAIL', notifyEmail],
  ['SKIP_QUESTION', skipToQuestion],
]);

const getBehaviourSchema = type => behaviourValidators.get(type) || (() => ({}));

const validator = (schema, item) => {
  const value = schema.validate(item);
  return !value.error;
};

export const scale = (item) => {
  const schema = joi.object({
    id: joi.string().required(),
    selectedValue: joi.number().min(0).max(10).required(),
    behaviour: joi.object(),
  });
  return validator(schema, item.response);
};

export const radio = (item) => {
  const selectedOption = item.configuration.options
    .find(({ id }) => id === item.response.selectedValue);
  if (!selectedOption) return false;

  let behaviourSchema = { behaviour: joi.alternatives([joi.object(), null]) };
  if (selectedOption.behaviour && selectedOption.behaviour.type) {
    const { behaviour } = selectedOption;
    behaviourSchema = getBehaviourSchema(behaviour.type)(behaviour);
  }

  const schema = joi.object({
    id: joi.string().required(),
    selectedValue: joi.string().min(0).max(10).required(),
    ...behaviourSchema,
  });
  return validator(schema, item.response);
};

export const checkBox = (item) => {
  const checkboxIds = item.configuration.options.map(({ id }) => id);
  const optionsExist = item.response.selectedValue.length
  && item.response.selectedValue.every(id => checkboxIds.includes(id));

  let behaviourSchema = { behaviour: joi.alternatives([joi.object(), null]) };
  if (item.behaviour && item.behaviour.type) {
    const { behaviour } = item;
    behaviourSchema = getBehaviourSchema(behaviour.type)(behaviour);
  }
  const schema = joi.object({
    id: joi.string().valid(item.id).required(),
    selectedValue: joi.array().min(1).required(),
    ...behaviourSchema,
  });
  return optionsExist && validator(schema, item.response);
};
