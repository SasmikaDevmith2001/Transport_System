const CreateUserUseCase = require('../../src/application/use-cases/users/CreateUserUseCase');
const { ConflictError } = require('../../src/domain/errors');

describe('CreateUserUseCase', () => {
  function buildDeps({ exists = false } = {}) {
    const createdUser = { id: 10, email: 'new@example.com' };
    const userRepository = {
      existsByEmail: jest.fn().mockResolvedValue(exists),
      create: jest.fn().mockResolvedValue(createdUser),
    };
    const hasher = { hash: jest.fn().mockResolvedValue('hashed-password') };
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    return { userRepository, hasher, logger, createdUser };
  }

  it('creates a user when email is unique', async () => {
    const deps = buildDeps();
    const useCase = new CreateUserUseCase(deps.userRepository, deps.hasher, deps.logger);

    const result = await useCase.execute({
      roleId: 2,
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      password: 'Password1',
      createdBy: 1,
    });

    expect(deps.hasher.hash).toHaveBeenCalledWith('Password1');
    expect(deps.userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@example.com', passwordHash: 'hashed-password', createdBy: 1 })
    );
    expect(result).toBe(deps.createdUser);
  });

  it('throws ConflictError when email already exists', async () => {
    const deps = buildDeps({ exists: true });
    const useCase = new CreateUserUseCase(deps.userRepository, deps.hasher, deps.logger);

    await expect(
      useCase.execute({
        roleId: 2,
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        password: 'Password1',
        createdBy: 1,
      })
    ).rejects.toThrow(ConflictError);

    expect(deps.userRepository.create).not.toHaveBeenCalled();
  });
});
