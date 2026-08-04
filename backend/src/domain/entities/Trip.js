class Trip {
  constructor({
    id,
    tripNumber,
    customerId,
    driverId,
    origin,
    destination,
    scheduledDate,
    scheduledTime,
    status,
    cargoDescription,
    remarks,
    assignedAt,
    startedAt,
    completedAt,
    createdBy,
    updatedBy,
    createdAt,
    updatedAt,
    deletedAt,
    customer,
    driver,
    stops = [],
  }) {
    this.id = id;
    this.tripNumber = tripNumber;
    this.customerId = customerId;
    this.driverId = driverId;
    this.origin = origin;
    this.destination = destination;
    this.scheduledDate = scheduledDate;
    this.scheduledTime = scheduledTime;
    this.status = status;
    this.cargoDescription = cargoDescription;
    this.remarks = remarks;
    this.assignedAt = assignedAt;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
    this.customer = customer; // { id, companyName } - denormalized for display
    this.driver = driver; // { id, firstName, lastName } - denormalized for display
    this.stops = stops;
  }

  isAssigned() {
    return !!this.driverId;
  }

  canBeAssigned() {
    return ['pending', 'assigned'].includes(this.status);
  }

  canTransitionTo(nextStatus) {
    const allowed = {
      pending: ['assigned', 'cancelled'],
      assigned: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };
    return (allowed[this.status] || []).includes(nextStatus);
  }
}

module.exports = Trip;
