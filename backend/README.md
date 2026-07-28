# Anuradha TMS - Backend API

RESTful API only. No frontend logic. Clean Architecture: Domain, Application,
Infrastructure, Presentation.

## Layers

- **Domain** (`src/domain`): entities, repository interfaces, enums, errors.
  Zero framework dependencies - pure JS.
- **Application** (`src/application`): use cases, DTOs, Joi validators,
  interfaces for infra services (ITokenService, IHasher, ILogger), shared
  helpers (ApiResponse, Pagination). Depends only on Domain.
- **Infrastructure** (`src/infrastructure`): Sequelize connection/models,
  repository implementations, JWT/bcrypt, Winston logging, env config.
  Implements the interfaces defined in Domain/Application.
- **Presentation** (`src/presentation`): Express routes, controllers,
  middleware (auth, RBAC, validation, error handling), Swagger docs.
- **Container** (`src/container`): composition root. The only place that
  wires concrete Infrastructure implementations into Application use
  cases and Presentation controllers.

Dependency rule: Presentation -> Application -> Domain. Infrastructure
implements Domain/Application interfaces but nothing in Domain/Application
imports Infrastructure or Presentation directly.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

The backend expects the schema to already exist (created by the sibling
`database` project's migrations/seeders). It never runs migrations or
`sequelize.sync()` itself.

Swagger docs: `http://localhost:4000/api-docs`
Health check: `http://localhost:4000/health`

## Module 1: Authentication & User Management

### Endpoints

| Method | Path | Auth | Permission | Description |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | No | - | Login, returns access + refresh token |
| POST | `/api/v1/auth/refresh` | No | - | Rotate refresh token, issue new access token |
| POST | `/api/v1/auth/logout` | No | - | Revoke refresh token |
| GET | `/api/v1/auth/me` | Yes | - | Current authenticated user |
| GET | `/api/v1/users` | Yes | `users:read` | List users (pagination/search/sort/filter) |
| GET | `/api/v1/users/:id` | Yes | `users:read` | Get user by id |
| POST | `/api/v1/users` | Yes | `users:create` | Create user |
| PUT | `/api/v1/users/:id` | Yes | `users:update` | Update user |
| DELETE | `/api/v1/users/:id` | Yes | `users:delete` | Soft-delete user |

### Auth flow
- JWT access token (short-lived, default 15m) carries `sub`, `email`,
  `role`, `permissions`.
- Refresh token (default 7d) is opaque to the client, stored server-side
  as a SHA-256 hash in `refresh_tokens`, rotated on every use (old token
  revoked, new one issued) to detect reuse/theft.
- RBAC enforced via `authorizeRoles`/`authorizePermissions` middleware,
  checking the decoded JWT payload against required roles/permissions.

### Testing
Unit tests cover use cases in isolation with mocked repositories/services
(no DB required):

```bash
npm test
```

Integration tests (routes + DB) can be added under `tests/integration`
once a test database is available - wire them through `supertest` against
`src/app.js`.

## Adding the next module
1. Add Domain entity + repository interface if new aggregate roots are needed
2. Add Application use cases, DTOs, Joi validators
3. Add Infrastructure Sequelize model + repository implementation
   (model must match the migration in the `database` project)
4. Add Presentation controller + routes, wire into `src/container`
5. Mount routes in `src/presentation/routes/index.js`
6. Add unit tests for use cases
