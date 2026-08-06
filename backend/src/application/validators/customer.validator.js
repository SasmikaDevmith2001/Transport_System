const Joi = require('joi');

const contactPersonSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  phone: Joi.string().trim().max(20).allow(null, ''),
  email: Joi.string().email({ tlds: false }).allow(null, ''),
});

const createCustomerSchema = Joi.object({
  companyName: Joi.string().trim().min(1).max(150).required(),
  contactPerson: Joi.string().trim().max(100).allow(null, ''),
  email: Joi.string().email({ tlds: false }).allow(null, ''),
  phone: Joi.string().trim().min(7).max(20).required(),
  addressLine1: Joi.string().trim().max(255).allow(null, ''),
  addressLine2: Joi.string().trim().max(255).allow(null, ''),
  city: Joi.string().trim().max(100).allow(null, ''),
  country: Joi.string().trim().max(100).default('Sri Lanka'),
  status: Joi.string().valid('active', 'inactive').default('active'),
  notes: Joi.string().trim().max(2000).allow(null, ''),
  contactPersons: Joi.array().items(contactPersonSchema).max(3).default([]),
});

const updateCustomerSchema = Joi.object({
  companyName: Joi.string().trim().min(1).max(150),
  contactPerson: Joi.string().trim().max(100).allow(null, ''),
  email: Joi.string().email({ tlds: false }).allow(null, ''),
  phone: Joi.string().trim().min(7).max(20),
  addressLine1: Joi.string().trim().max(255).allow(null, ''),
  addressLine2: Joi.string().trim().max(255).allow(null, ''),
  city: Joi.string().trim().max(100).allow(null, ''),
  country: Joi.string().trim().max(100),
  status: Joi.string().valid('active', 'inactive'),
  notes: Joi.string().trim().max(2000).allow(null, ''),
  contactPersons: Joi.array().items(contactPersonSchema).max(3),
}).min(1);

const listCustomersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100),
  sortBy: Joi.string().valid('companyName', 'createdAt', 'status', 'city'),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC'),
  search: Joi.string().trim().allow(''),
  status: Joi.string().valid('active', 'inactive'),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = { createCustomerSchema, updateCustomerSchema, listCustomersQuerySchema, idParamSchema };
