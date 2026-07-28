const { ConflictError } = require('../../../domain/errors');

class CreateUserUseCase {
  constructor(userRepository, hasher, logger) {
    this.userRepository = userRepository;
    this.hasher = hasher;
    this.logger = logger;
  }

  async execute({ roleId, firstName, lastName, email, phone, password, status, createdBy }) {
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await this.hasher.hash(password);

    const user = await this.userRepository.create({
      roleId,
      firstName,
      lastName,
      email,
      phone: phone || null,
      passwordHash,
      status: status || 'active',
      createdBy,
    });

    this.logger.info('User created', { userId: user.id, createdBy });

    return user;
  }
}

module.exports = CreateUserUseCase;
