import Joi from 'joi';

export const zoneValidation = {
  create: Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().allow(''),
    area: Joi.string().allow(''),
    city: Joi.string().max(100).required(),
    service_location_id: Joi.string().uuid().required(),
    coordinates: Joi.array().items(
      Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      })
    ),
  }),

  update: Joi.object({
    name: Joi.string().max(100),
    description: Joi.string().allow(''),
    area: Joi.string().allow(''),
    city: Joi.string().max(100),
    service_location_id: Joi.string().uuid(),
    coordinates: Joi.array().items(
      Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
      })
    ),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(255),
    name: Joi.string().max(100),
    service_location_id: Joi.string().uuid(),
  }),
};