const { NotFoundError } = require('../../../domain/errors');

class DeleteUserUseCase {
  constructor(userRepository, logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  async execute(id, deletedBy) {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('User not found');
    }

    await this.userRepository.softDelete(id);
    this.logger.info('User soft-deleted', { userId: id, deletedBy });
  }
}

module.exports = DeleteUserUseCase;
