const { Op } = require('sequelize');
const ICustomerRepository = require('../../../domain/repositories/ICustomerRepository');
const Customer = require('../../../domain/entities/Customer');
const { Customer: CustomerModel } = require('../sequelize/models');

function toDomain(instance) {
  if (!instance) return null;
  const plain = instance.get({ plain: true });
  return new Customer({
    id: plain.id,
    companyName: plain.companyName,
    contactPerson: plain.contactPerson,
    email: plain.email,
    phone: plain.phone,
    addressLine1: plain.addressLine1,
    addressLine2: plain.addressLine2,
    city: plain.city,
    country: plain.country,
    status: plain.status,
    notes: plain.notes,
    createdBy: plain.createdBy,
    updatedBy: plain.updatedBy,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    deletedAt: plain.deletedAt,
  });
}

class CustomerRepository extends ICustomerRepository {
  async findById(id) {
    const instance = await CustomerModel.findByPk(id);
    return toDomain(instance);
  }

  async create(data) {
    const instance = await CustomerModel.create(data);
    return toDomain(instance);
  }

  async update(id, data) {
    await CustomerModel.update(data, { where: { id } });
    return this.findById(id);
  }

  async softDelete(id) {
    await CustomerModel.destroy({ where: { id } });
  }

  async list({ page, pageSize, offset, sortBy, sortOrder, search, status }) {
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { companyName: { [Op.like]: `%${search}%` } },
        { contactPerson: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await CustomerModel.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return { rows: rows.map(toDomain), total: count, page, pageSize };
  }
}

module.exports = new CustomerRepository();
