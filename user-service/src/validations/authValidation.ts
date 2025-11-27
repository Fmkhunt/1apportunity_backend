import Joi from 'joi';

export const authValidation = {
  register: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(15).required(),
    name: Joi.string().min(2).max(50).required(),
    referral_by: Joi.string().min(6),
    otp: Joi.number().required(),
    ccode: Joi.string().min(1).max(10).required(),
    country: Joi.string().min(1).max(100).required(),
  }),


  login: Joi.object({
    phone: Joi.string().min(10).max(15).required(),
    ccode: Joi.string().min(1).max(10).required(),
    otp: Joi.number().required(),
    device_token: Joi.string().optional(),
    device_type: Joi.string().valid('android', 'ios', 'web').optional(),
  }),

  sendOtp: Joi.object({
    phone: Joi.string().min(10).max(15).required(),
    ccode: Joi.string().min(1).max(10).required(),
    type: Joi.string().valid('register', 'login').required(),
  }),

};