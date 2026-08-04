const Joi = require('joi');

const tripStopSchema = Joi.object({
  locationName: Joi.string().trim().min(1).max(255).required(),
  address: Joi.string().trim().max(255).allow(null, ''),
  contactName: Joi.string().trim().max(100).allow(null, ''),
  contactPhone: Joi.string().trim().max(20).allow(null, ''),
  notes: Joi.string().trim().max(255).allow(null, ''),
});

const createTripSchema = Joi.object({
  customerId: Joi.number().integer().positive().required(),
  driverId: Joi.number().integer().positive().allow(null),
  origin: Joi.string().trim().min(1).max(255).required(),
  destination: Joi.string().trim().min(1).max(255).required(),
  scheduledDate: Joi.date().iso().required(),
  scheduledTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .allow(null, '')
    .messages({ 'string.pattern.base': 'scheduledTime must be in HH:mm format' }),
  cargoDescription: Joi.string().trim().max(255).allow(null, ''),
  remarks: Joi.string().trim().max(2000).allow(null, ''),
  stops: Joi.array().items(tripStopSchema).default([]),
});

const updateTripSchema = Joi.object({
  customerId: Joi.number().integer().positive(),
  origin: Joi.string().trim().min(1).max(255),
  destination: Joi.string().trim().min(1).max(255),
  scheduledDate: Joi.date().iso(),
  scheduledTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .allow(null, ''),
  cargoDescription: Joi.string().trim().max(255).allow(null, ''),
  remarks: Joi.string().trim().max(2000).allow(null, ''),
  stops: Joi.array().items(tripStopSchema),
}).min(1);

const assignTripSchema = Joi.object({
  driverId: Joi.number().integer().positive().required(),
});

const updateTripStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'assigned', 'in_progress', 'completed', 'cancelled').required(),
});

const listTripsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1),
  pageSize: Joi.number().integer().min(1).max(100),
  sortBy: Joi.string().valid('scheduledDate', 'createdAt', 'status', 'tripNumber'),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC'),
  search: Joi.string().trim().allow(''),
  status: Joi.string().valid('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
  driverId: Joi.number().integer().positive(),
  customerId: Joi.number().integer().positive(),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

module.exports = {
  createTripSchema,
  updateTripSchema,
  assignTripSchema,
  updateTripStatusSchema,
  listTripsQuerySchema,
  idParamSchema,
};
