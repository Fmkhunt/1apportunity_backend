import Joi from 'joi';

export const serviceLocationValidation = {
  create: Joi.object({
    country: Joi.string().max(100).required(),
    timezone: Joi.string().max(50).required(),
    currency: Joi.string().max(50).required(),
    currency_sign: Joi.string().max(10).required(),
    currency_short: Joi.string().max(10).required(),
    map: Joi.string().max(50).required(),
    payment_gateway: Joi.string().max(50).required(),
  }),

  update: Joi.object({
    country: Joi.string().max(100),
    timezone: Joi.string().max(50),
    currency: Joi.string().max(50),
    currency_sign: Joi.string().max(10),
    currency_short: Joi.string().max(10),
    map: Joi.string().max(50),
    payment_gateway: Joi.string().max(50),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255),
    country: Joi.string().max(100),
    timezone: Joi.string().max(50),
    currency: Joi.string().max(50),
    map: Joi.string().max(50),
    payment_gateway: Joi.string().max(50),
  }),
};