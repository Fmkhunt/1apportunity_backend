import Joi from 'joi';

export const paymentValidation = {
  createSession: Joi.object({
    count: Joi.number().integer().positive().required().messages({
      'number.base': 'Count must be a number',
      'number.integer': 'Count must be an integer',
      'number.positive': 'Count must be positive',
      'any.required': 'Count is required',
    }),
    payment_type: Joi.string().valid('tokens', 'credits').required().messages({
      'any.only': 'Payment type must be either "tokens" or "credits"',
      'any.required': 'Payment type is required',
    }),
    platform: Joi.string().valid('web', 'mobile').optional().messages({
      'string.base': 'Platform must be a string',
      'any.only': 'Platform must be either "web" or "mobile"',
    }),
  }),
};