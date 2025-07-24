import Joi from 'joi';

export const taskValidation = {
  create: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(1).required(),
    duration: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
    reward: Joi.number().integer().min(1).required(),
    status: Joi.string().valid('active', 'inactive').default('active'),
    created_by: Joi.string().required(),
    updated_by: Joi.string().required(),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().min(1).optional(),
    duration: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
    reward: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    updated_by: Joi.string().required(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('active', 'inactive').optional(),
    search: Joi.string().min(1).optional(),
  }),
};