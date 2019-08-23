import joi from '@hapi/joi';

export const uploadDocument = (behaviour) => {
  const schema = {
    type: joi.string().valid(behaviour.type).required(),
    payload: joi.string().valid(behaviour.payload).required(),
    document: joi.object().required(),
  };

  return { behaviour: joi.object(schema).required() };
};

export const previewDocument = (behaviour) => {
  const schema = {
    type: joi.string().valid(behaviour.type).required(),
    payload: joi.string().valid(behaviour.payload).required(),
  };

  return { behaviour: joi.object(schema).required() };
};

export const skipToQuestion = (behaviour) => {
  const schema = {
    type: joi.string().valid(behaviour.type).required(),
    payload: joi.string().allow(''),
  };

  return { behaviour: joi.object(schema).required() };
};

export const notifyEmail = (behaviour) => {
  const schema = {
    type: joi.string().valid(behaviour.type).required(),
    payload: joi.object({
      recipient: joi.string().email().required(),
      template: joi.string().min(25).max(200).required(),
    }).required(),
  };

  return { behaviour: joi.object(schema).required() };
};
