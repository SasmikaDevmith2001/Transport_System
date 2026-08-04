function toTripStopResponseDto(stop) {
  return {
    id: stop.id,
    sequenceNo: stop.sequenceNo,
    locationName: stop.locationName,
    address: stop.address,
    contactName: stop.contactName,
    contactPhone: stop.contactPhone,
    status: stop.status,
    notes: stop.notes,
    arrivedAt: stop.arrivedAt,
    deliveredAt: stop.deliveredAt,
  };
}

function toTripResponseDto(trip) {
  if (!trip) return null;
  return {
    id: trip.id,
    tripNumber: trip.tripNumber,
    customerId: trip.customerId,
    customer: trip.customer,
    driverId: trip.driverId,
    driver: trip.driver,
    origin: trip.origin,
    destination: trip.destination,
    scheduledDate: trip.scheduledDate,
    scheduledTime: trip.scheduledTime,
    status: trip.status,
    cargoDescription: trip.cargoDescription,
    remarks: trip.remarks,
    assignedAt: trip.assignedAt,
    startedAt: trip.startedAt,
    completedAt: trip.completedAt,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
    stops: (trip.stops || []).map(toTripStopResponseDto),
  };
}

module.exports = { toTripResponseDto, toTripStopResponseDto };
