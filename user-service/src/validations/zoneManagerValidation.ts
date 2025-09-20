import Joi from 'joi';

export const zoneManagerValidation = {

  zoneManagerCreate: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('zone_manager').default('zone_manager'),
    permissions: Joi.array().items(Joi.string()).optional(),
    zone_id: Joi.string().uuid().required(),
  }),
  zoneManagerUpdate: Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string().valid('zone_manager').optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
    zone_id: Joi.string().uuid().optional(),
  }),
  listValidation: Joi.object({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    search: Joi.string().optional().allow(''),
  }),
};