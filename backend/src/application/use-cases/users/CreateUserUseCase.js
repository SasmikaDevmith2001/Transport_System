const { ConflictError, ForbiddenError } = require('../../../domain/errors');
const RoleName = require('../../../domain/enums/RoleName');

class CreateUserUseCase {
  constructor(userRepository, roleRepository, hasher, logger) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.hasher = hasher;
    this.logger = logger;
  }

  async execute({ roleId, firstName, lastName, email, phone, password, status, createdBy, actorRole }) {
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw new ConflictError('A user with this email already exists');
    }

    const targetRole = await this.roleRepository.findById(roleId);
    if (targetRole?.name === RoleName.SUPER_ADMIN && actorRole !== RoleName.SUPER_ADMIN) {
      throw new ForbiddenError('Only Super Admin can create Super Admin accounts');
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
