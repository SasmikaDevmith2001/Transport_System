const { NotFoundError } = require('../../../domain/errors');

class CreateTripUseCase {
  constructor(tripRepository, customerRepository, driverRepository, logger) {
    this.tripRepository = tripRepository;
    this.customerRepository = customerRepository;
    this.driverRepository = driverRepository;
    this.logger = logger;
  }

  async execute({ customerId, driverId, stops = [], createdBy, ...data }) {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    if (driverId) {
      const driver = await this.driverRepository.findById(driverId);
      if (!driver) {
        throw new NotFoundError('Driver not found');
      }
    }

    const tripNumber = await this.tripRepository.generateNextTripNumber();
    const status = driverId ? 'assigned' : 'pending';

    const trip = await this.tripRepository.create(
      {
        ...data,
        tripNumber,
        customerId,
        driverId: driverId || null,
        status,
        assignedAt: driverId ? new Date() : null,
        createdBy,
      },
      stops
    );

    this.logger.info('Trip created', { tripId: trip.id, tripNumber, createdBy });
    return trip;
  }
}

module.exports = CreateTripUseCase;
