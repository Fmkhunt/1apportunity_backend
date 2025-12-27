import Joi from 'joi';

export const withdrawalValidation = {
  createRequest: Joi.object({
    coins: Joi.number().integer().positive().required().messages({
      'number.base': 'Coins must be a number',
      'number.integer': 'Coins must be an integer',
      'number.positive': 'Coins must be positive',
      'any.required': 'Coins is required',
    }),
  }),
  reject: Joi.object({
    reason: Joi.string().optional().allow('', null).messages({
      'string.base': 'Reason must be a string',
    }),
  }),
  pagination: Joi.object({
    page: Joi.number().integer().positive().optional().default(1),
    limit: Joi.number().integer().positive().max(100).optional().default(10),
  }),
};
