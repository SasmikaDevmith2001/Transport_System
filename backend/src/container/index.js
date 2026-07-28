/**
 * Composition root. This is the ONLY place where concrete Infrastructure
 * implementations are wired into Application use cases, and where
 * Presentation controllers receive their use case dependencies.
 *
 * Domain and Application layers never import from Infrastructure or
 * Presentation directly - everything flows through here.
 */

// Infrastructure implementations
const userRepository = require('../infrastructure/database/repositories/UserRepository');
const roleRepository = require('../infrastructure/database/repositories/RoleRepository');
const refreshTokenRepository = require('../infrastructure/database/repositories/RefreshTokenRepository');
const hasher = require('../infrastructure/auth/BcryptHasher');
const tokenService = require('../infrastructure/auth/JwtTokenService');
const logger = require('../infrastructure/logging/WinstonLogger');

// Application use cases
const LoginUseCase = require('../application/use-cases/auth/LoginUseCase');
const RefreshTokenUseCase = require('../application/use-cases/auth/RefreshTokenUseCase');
const LogoutUseCase = require('../application/use-cases/auth/LogoutUseCase');
const CreateUserUseCase = require('../application/use-cases/users/CreateUserUseCase');
const GetUserUseCase = require('../application/use-cases/users/GetUserUseCase');
const ListUsersUseCase = require('../application/use-cases/users/ListUsersUseCase');
const UpdateUserUseCase = require('../application/use-cases/users/UpdateUserUseCase');
const DeleteUserUseCase = require('../application/use-cases/users/DeleteUserUseCase');

// Presentation controllers
const AuthController = require('../presentation/controllers/auth.controller');
const UserController = require('../presentation/controllers/user.controller');

// --- Wire use cases ---
const loginUseCase = new LoginUseCase(userRepository, roleRepository, refreshTokenRepository, hasher, tokenService, logger);
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, roleRepository, refreshTokenRepository, tokenService, logger);
const logoutUseCase = new LogoutUseCase(refreshTokenRepository, tokenService);

const createUserUseCase = new CreateUserUseCase(userRepository, hasher, logger);
const getUserUseCase = new GetUserUseCase(userRepository);
const listUsersUseCase = new ListUsersUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository, logger);
const deleteUserUseCase = new DeleteUserUseCase(userRepository, logger);

// --- Wire controllers ---
const authController = new AuthController({ loginUseCase, refreshTokenUseCase, logoutUseCase, getUserUseCase });
const userController = new UserController({
  createUserUseCase,
  getUserUseCase,
  listUsersUseCase,
  updateUserUseCase,
  deleteUserUseCase,
});

module.exports = {
  authController,
  userController,
  logger,
};
