import Joi from 'joi';

export const clueValidation = {
  create: Joi.object({
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(1).required(),
    task_ids: Joi.array().items(Joi.string().uuid()).optional().default([]),
    token: Joi.number().optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().min(1).optional(),
    task_ids: Joi.array().items(Joi.string().uuid()).optional(),
    token: Joi.number().optional(),
  }).min(1), // At least one field is required for update

  updateTasks: Joi.object({
    task_ids: Joi.array().items(Joi.string().uuid()).required(),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('').optional(),
  }),

  getClueForUser: Joi.object({
    taskId: Joi.string().uuid().required(),
  }),

};
