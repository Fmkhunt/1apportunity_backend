import Joi from 'joi';

export const authValidation = {


  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  zoneManagerCreate: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('zone_manager').default('zone_manager'),
    area: Joi.string().optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
  }),
  zoneManagerUpdate: Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string().valid('zone_manager').optional(),
    area: Joi.string().optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
  }),

};