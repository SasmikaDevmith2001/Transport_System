const { Op } = require('sequelize');
const IUserRepository = require('../../../domain/repositories/IUserRepository');
const User = require('../../../domain/entities/User');
const { User: UserModel, Role: RoleModel } = require('../sequelize/models');

function toDomain(instance) {
  if (!instance) return null;
  const plain = instance.get({ plain: true });
  return new User({
    id: plain.id,
    roleId: plain.roleId,
    roleName: plain.Role ? plain.Role.name : undefined,
    firstName: plain.firstName,
    lastName: plain.lastName,
    email: plain.email,
    phone: plain.phone,
    passwordHash: plain.passwordHash,
    status: plain.status,
    lastLoginAt: plain.lastLoginAt,
    createdBy: plain.createdBy,
    updatedBy: plain.updatedBy,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    deletedAt: plain.deletedAt,
  });
}

/**
 * Concrete implementation of IUserRepository backed by Sequelize. This is
 * the only place in the codebase that should import the User Sequelize
 * model directly.
 */
class UserRepository extends IUserRepository {
  async findById(id) {
    const instance = await UserModel.findByPk(id, { include: [RoleModel] });
    return toDomain(instance);
  }

  async findByEmail(email) {
    const instance = await UserModel.findOne({ where: { email }, include: [RoleModel] });
    return toDomain(instance);
  }

  async existsByEmail(email) {
    const count = await UserModel.count({ where: { email } });
    return count > 0;
  }

  async create(userData) {
    const instance = await UserModel.create(userData);
    return toDomain(instance);
  }

  async update(id, userData) {
    await UserModel.update(userData, { where: { id } });
    return this.findById(id);
  }

  async softDelete(id) {
    await UserModel.destroy({ where: { id } }); // paranoid: soft delete
  }

  async list({ page, pageSize, offset, sortBy, sortOrder, search, status, roleId }) {
    const where = {};

    if (status) {
      where.status = status;
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await UserModel.findAndCountAll({
      where,
      include: [RoleModel],
      limit: pageSize,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return {
      rows: rows.map(toDomain),
      total: count,
      page,
      pageSize,
    };
  }
}

module.exports = new UserRepository();
