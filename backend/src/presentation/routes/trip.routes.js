const { Router } = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { authorizePermissions } = require('../middleware/authorize');
const {
  createTripSchema,
  updateTripSchema,
  assignTripSchema,
  updateTripStatusSchema,
  listTripsQuerySchema,
  idParamSchema,
} = require('../../application/validators/trip.validator');

module.exports = (tripController) => {
  const router = Router();

  router.use(authenticate);

  // Drivers have `trips:read` and use these same endpoints - scoping to
  // "assigned to me" is enforced in ListTripsUseCase/GetTripUseCase, not here.
  router.get(
    '/',
    authorizePermissions('trips:read'),
    validate(listTripsQuerySchema, 'query'),
    asyncHandler(tripController.list)
  );

  router.get(
    '/:id',
    authorizePermissions('trips:read'),
    validate(idParamSchema, 'params'),
    asyncHandler(tripController.getById)
  );

  router.post(
    '/',
    authorizePermissions('trips:create'),
    validate(createTripSchema),
    asyncHandler(tripController.create)
  );

  router.put(
    '/:id',
    authorizePermissions('trips:update'),
    validate(idParamSchema, 'params'),
    validate(updateTripSchema),
    asyncHandler(tripController.update)
  );

  router.patch(
    '/:id/assign',
    authorizePermissions('trips:assign'),
    validate(idParamSchema, 'params'),
    validate(assignTripSchema),
    asyncHandler(tripController.assign)
  );

  // Status transitions are shared between Admin/Super Admin (any trip) and
  // Driver (only their own assigned trip, e.g. starting/completing a delivery).
  router.patch(
    '/:id/status',
    authorizePermissions('trips:update', 'trips:read'),
    validate(idParamSchema, 'params'),
    validate(updateTripStatusSchema),
    asyncHandler(tripController.updateStatus)
  );

  router.delete(
    '/:id',
    authorizePermissions('trips:delete'),
    validate(idParamSchema, 'params'),
    asyncHandler(tripController.remove)
  );

  return router;
};
