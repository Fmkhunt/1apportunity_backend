import Joi from 'joi';

export const huntValidation = {
  create: Joi.object({
    task_id: Joi.string().uuid().required(),
    claim_id: Joi.string().uuid().required(),
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(1).required(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
    coordinates: Joi.alternatives().try(
      Joi.string().required(), // WKT format
      Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
      }).required()
    ),
    duration: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  }),
  update: Joi.object({
    task_id: Joi.string().uuid().optional(),
    claim_id: Joi.string().uuid().optional(),
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().min(1).optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
    coordinates: Joi.alternatives().try(
      Joi.string().optional(), // WKT format
      Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
      }).optional()
    ),
    duration: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().min(1).optional(),
    task_id: Joi.string().uuid().optional(),
    claim_id: Joi.string().uuid().optional(),
  }),
  getHuntForUser: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid('claimed', 'started', 'arrived', 'completed').required(),
  }),
  completeHuntClaim: Joi.object({
    hunt_id: Joi.string().uuid().required(),
    task_id: Joi.string().uuid().required(),
    answers: Joi.array().items(Joi.object({
      question_id: Joi.string().uuid().required(),
      answer: Joi.string().required(),
    })),
  }),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

}; 