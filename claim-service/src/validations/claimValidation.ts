import Joi from 'joi';

export const claimValidation = {
  create: Joi.object({
    reward: Joi.number().integer().min(1).required(),
    claim_type: Joi.string().min(1).max(255).required(),
    levels: Joi.array().items(
      Joi.object({
        level: Joi.number().integer().min(1).required(),
        user_count: Joi.number().integer().min(1).required(),
        rewards: Joi.number().integer().min(1).required(),
      })
    ).optional(),
    coupen_code: Joi.string().max(100).optional(),
    product_img: Joi.string().max(255).optional(),
  }),

  update: Joi.object({
    reward: Joi.number().integer().min(1).optional(),
    claim_type: Joi.string().min(1).max(255).optional(),
    levels: Joi.array().items(
      Joi.object({
        level: Joi.number().integer().min(1).required(),
        user_count: Joi.number().integer().min(1).required(),
        rewards: Joi.number().integer().min(1).required(),
      })
    ).optional(),
    coupen_code: Joi.string().max(100).optional(),
    product_img: Joi.string().max(255).optional(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().min(1).optional(),
    claim_type: Joi.string().min(1).optional(),
  }),
}; 