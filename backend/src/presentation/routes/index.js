const { Router } = require('express');

function buildRouter(container) {
  const router = Router();

  router.use('/auth', require('./auth.routes')(container.authController));
  router.use('/users', require('./user.routes')(container.userController));

  return router;
}

module.exports = buildRouter;
