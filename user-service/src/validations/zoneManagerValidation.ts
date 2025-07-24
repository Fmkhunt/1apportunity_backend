import Joi from 'joi';

export const zoneManagerValidation = {

  zoneManagerCreate: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('zone_manager').default('zone_manager'),
    permissions: Joi.array().items(Joi.string()).optional(),
    coordinates: Joi.array().items(Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    })).required(),
  }),
  zoneManagerUpdate: Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string().valid('zone_manager').optional(),
    coordinates: Joi.array().items(Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    })).optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
  }),
  listValidation: Joi.object({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    search: Joi.string().optional().allow(''),
  }),
};