class TripStop {
  constructor({
    id,
    tripId,
    sequenceNo,
    locationName,
    address,
    contactName,
    contactPhone,
    status,
    notes,
    arrivedAt,
    deliveredAt,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.tripId = tripId;
    this.sequenceNo = sequenceNo;
    this.locationName = locationName;
    this.address = address;
    this.contactName = contactName;
    this.contactPhone = contactPhone;
    this.status = status;
    this.notes = notes;
    this.arrivedAt = arrivedAt;
    this.deliveredAt = deliveredAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = TripStop;
