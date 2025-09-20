import Joi from 'joi';

export const authValidation = {

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  
  adminCreate: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().default('manager'),
    zone_id: Joi.string().uuid().optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
  }),
  
  adminUpdate: Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string().optional(),
    zone_id: Joi.string().uuid().optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
  }),

  zoneManagerCreate: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('zone_manager').default('zone_manager'),
    zone_id: Joi.string().uuid().optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
  }),
  
  zoneManagerUpdate: Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    role: Joi.string().valid('zone_manager').optional(),
    zone_id: Joi.string().uuid().optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
  }),

};