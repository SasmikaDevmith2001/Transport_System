const { NotFoundError, ValidationError } = require('../../../domain/errors');

class UpdateTripUseCase {
  constructor(tripRepository, logger) {
    this.tripRepository = tripRepository;
    this.logger = logger;
  }

  async execute(id, { stops, ...updates }, updatedBy) {
    const existing = await this.tripRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Trip not found');
    }

    if (['completed', 'cancelled'].includes(existing.status)) {
      throw new ValidationError(`Cannot modify a trip that is already ${existing.status}`);
    }

    let trip = existing;
    if (Object.keys(updates).length > 0) {
      trip = await this.tripRepository.update(id, { ...updates, updatedBy });
    }

    if (stops) {
      trip = await this.tripRepository.replaceStops(id, stops);
    }

    this.logger.info('Trip updated', { tripId: id, updatedBy });
    return trip;
  }
}

module.exports = UpdateTripUseCase;
