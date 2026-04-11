import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  nickname: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  city: Joi.string().min(1).max(100).optional(),
  gender: Joi.string().valid('Male', 'Female', 'Prefer not to say').optional(),
  dateOfBirth: Joi.date().iso().optional(),
  profileImage: Joi.string().uri().optional(),
});

export const addAddressSchema = Joi.object({
  name: Joi.string().min(1).max(80).optional(),
  label: Joi.string().min(1).max(80).optional(),
  type: Joi.string().min(1).max(80).optional(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required(),
  isDefault: Joi.boolean().optional(),
});

export const updateAddressSchema = Joi.object({
  name: Joi.string().min(1).max(80).optional(),
  label: Joi.string().min(1).max(80).optional(),
  type: Joi.string().min(1).max(80).optional(),
  street: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  country: Joi.string().optional(),
  isDefault: Joi.boolean().optional(),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
});
