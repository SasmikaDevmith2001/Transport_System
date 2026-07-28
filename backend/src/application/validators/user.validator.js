const Joi = require('joi');

const createUserSchema = Joi.object({
  roleId: Joi.number().integer().positive().required(),
  firstName: Joi.string().trim().min(1).max(100).required(),
  lastName: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().max(20).allow(null, ''),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  status: Joi.string().valid('active', 'inactive', 'suspended').default('active'),
});

const updateUserSchema = Joi.object({
  roleId: Joi.number().integer().positive(),
  firstName: Joi.string().trim().min(1).max(100),
  lastName: Joi.string().trim().min(1).max(100),
  phone: Joi.string().trim().max(20).allow(null, ''),
  status: Joi.string().valid('active', 'inactive', 'suspended'),
}).min(1);

const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100),
  sortBy: Joi.string().valid('firstName', 'lastName', 'email', 'createdAt', 'status'),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC'),
  search: Joi.string().trim().allow(''),
  status: Joi.string().valid('active', 'inactive', 'suspended'),
  roleId: Joi.number().integer().positive(),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  idParamSchema,
};
