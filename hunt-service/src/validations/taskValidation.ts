import { TCompleteTaskStatus } from '@/types';
import Joi from 'joi';

export const taskValidation = {
  create: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(1).required(),
    duration: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required(),
    reward: Joi.number().integer().min(1).required(),
    status: Joi.string().valid('active', 'inactive').default('active'),
    type: Joi.string().valid('question', 'mission').required(),
    clue_ids: Joi.array().items(Joi.string().uuid()).optional(),
    claim_id: Joi.string().uuid().required(),
    questions: Joi.array().when('type', {
      is: 'question',
      then: Joi.array().items(Joi.object({
        question: Joi.string().required(),
        answer: Joi.string().required(),
        question_type: Joi.string().valid('text', 'mcq').default('text'),
        options: Joi.array().when('question_type', {
          is: 'mcq',
          then: Joi.array().items(Joi.object({
            option: Joi.string().required(),
            text: Joi.string().required(),
          }).required()),
        }),
      })),
    }),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    description: Joi.string().min(1).optional(),
    duration: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
    reward: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    clue_ids: Joi.array().items(Joi.string().uuid()).optional(),
    claim_id: Joi.string().uuid().optional(),
    questions: Joi.array().when('type', {
      is: 'question',
      then: Joi.array().items(Joi.object({
        question: Joi.string().required(),
        answer: Joi.string().required(),
        question_type: Joi.string().valid('text', 'mcq').default('text'),
        options: Joi.array().when('question_type', {
          is: 'mcq',
          then: Joi.array().items(Joi.object({
            option: Joi.string().required(),
            text: Joi.string().required(),
          }).required()),
        }),
      })),
    })
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('active', 'inactive').optional(),
    search: Joi.string().min(1).optional(),
  }),

  completeTask: Joi.object({
    hunt_id: Joi.string().uuid().required(),
    task_id: Joi.string().uuid().required(),
    answers: Joi.array().items(Joi.object({
      question_id: Joi.string().uuid().required(),
      answer: Joi.string().required(),
    })).optional(),
  }),

  completeMissionTask: Joi.object({
    hunt_id: Joi.string().uuid().required(),
    task_id: Joi.string().uuid().required(),
    asset_urls: Joi.array().items(Joi.string().uri().required()),
  }),

  completedTasksHistory: Joi.object({
    hunt_id: Joi.string().uuid().optional(),
    task_id: Joi.string().uuid().optional(),
    status: Joi.string().valid('pending', 'completed', 'rejected', 'failed').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  updateCompletedTaskStatus: Joi.object({
    completed_task_id: Joi.string().uuid().required(),
    status: Joi.string().valid('pending', 'completed', 'rejected', 'failed').required(),
  }),
  completeQRCodeMissionTask: Joi.object({
    hunt_id: Joi.string().uuid().required(),
    task_id: Joi.string().uuid().required(),
  }),
};