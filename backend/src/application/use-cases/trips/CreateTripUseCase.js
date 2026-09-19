const { NotFoundError } = require('../../../domain/errors');
const { getDrivingDistanceKm } = require('../../../infrastructure/services/OsrmService');

class CreateTripUseCase {
  constructor(tripRepository, customerRepository, driverRepository, locationRepository, logger) {
    this.tripRepository = tripRepository;
    this.customerRepository = customerRepository;
    this.driverRepository = driverRepository;
    this.locationRepository = locationRepository;
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

    // Resolve location coordinates for stops that have locationId
    const resolvedStops = await this._resolveStopLocations(stops);

    // Calculate expected mileage between consecutive stops
    await this._calculateExpectedMileages(resolvedStops, data.origin);

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
      resolvedStops
    );

    this.logger.info('Trip created', { tripId: trip.id, tripNumber, createdBy });
    return trip;
  }

  async _resolveStopLocations(stops) {
    const resolved = [];
    for (const stop of stops) {
      const s = { ...stop };
      if (stop.locationId) {
        const loc = await this.locationRepository.findById(stop.locationId);
        if (loc) {
          s.locationId = loc.id;
          s.locationName = s.locationName || loc.name;
          // Store the known coordinates from the saved location
          s._lat = loc.latitude;
          s._lon = loc.longitude;
        }
      }
      resolved.push(s);
    }
    return resolved;
  }

  async _calculateExpectedMileages(stops, originName) {
    // Try to find origin in locations
    let prevLat = null;
    let prevLon = null;

    // If origin matches a saved location, use its coordinates
    if (this.locationRepository) {
      const allActive = await this.locationRepository.listActive();
      const originLoc = allActive.find((l) => l.name === originName);
      if (originLoc) {
        prevLat = originLoc.latitude;
        prevLon = originLoc.longitude;
      }
    }

    for (const stop of stops) {
      const curLat = stop._lat;
      const curLon = stop._lon;

      if (prevLat && prevLon && curLat && curLon) {
        const distance = await getDrivingDistanceKm(prevLat, prevLon, curLat, curLon);
        if (distance !== null) {
          stop.expectedMileage = distance;
        }
      }

      // Move reference point forward
      if (curLat && curLon) {
        prevLat = curLat;
        prevLon = curLon;
      }

      // Clean up temporary fields
      delete stop._lat;
      delete stop._lon;
    }
  }
}

module.exports = CreateTripUseCase;
