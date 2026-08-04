const { NotFoundError, ForbiddenError } = require('../../../domain/errors');
const RoleName = require('../../../domain/enums/RoleName');

class UpdateUserUseCase {
  constructor(userRepository, roleRepository, logger) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.logger = logger;
  }

  async execute(id, updates, updatedBy, actorRole) {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    if (updates.roleId) {
      const targetRole = await this.roleRepository.findById(updates.roleId);
      const isPromotingToSuperAdmin = targetRole?.name === RoleName.SUPER_ADMIN;
      const existingRole = await this.roleRepository.findById(existing.roleId);
      const isDemotingSuperAdmin = existingRole?.name === RoleName.SUPER_ADMIN && !isPromotingToSuperAdmin;

      if ((isPromotingToSuperAdmin || isDemotingSuperAdmin) && actorRole !== RoleName.SUPER_ADMIN) {
        throw new ForbiddenError('Only Super Admin can assign or change the Super Admin role');
      }
    }

    const user = await this.userRepository.update(id, { ...updates, updatedBy });
    this.logger.info('User updated', { userId: id, updatedBy });
    return user;
  }
}

module.exports = UpdateUserUseCase;
