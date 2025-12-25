import Joi from 'joi';
import { TStorageType } from '../types';
// const storageTypes = ['profile', 'document', 'video', 'image', 'other'] as const;

export const storageValidation = {
  upload: Joi.object({
    type: Joi.string()
      .valid(...Object.values(TStorageType))
      .required(),
  }),
  remove: Joi.object({
    key: Joi.string().min(3).required(),
  }),
};
