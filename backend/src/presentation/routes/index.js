const { Router } = require('express');

function buildRouter(container) {
  const router = Router();

  router.use('/auth', require('./auth.routes')(container.authController));
  router.use('/users', require('./user.routes')(container.userController));
  router.use('/roles', require('./role.routes')(container.roleController));
  router.use('/customers', require('./customer.routes')(container.customerController));
  router.use('/drivers', require('./driver.routes')(container.driverController));
  router.use('/trips', require('./trip.routes')(container.tripController));

  return router;
}

module.exports = buildRouter;
