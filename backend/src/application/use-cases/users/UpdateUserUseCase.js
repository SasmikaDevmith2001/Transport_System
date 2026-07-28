const { NotFoundError } = require('../../../domain/errors');

class UpdateUserUseCase {
  constructor(userRepository, logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  async execute(id, updates, updatedBy) {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    const user = await this.userRepository.update(id, { ...updates, updatedBy });
    this.logger.info('User updated', { userId: id, updatedBy });
    return user;
  }
}

module.exports = UpdateUserUseCase;
