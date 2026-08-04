class Driver {
  constructor({
    id,
    userId,
    firstName,
    lastName,
    nicNumber,
    phone,
    email,
    licenseNumber,
    licenseExpiry,
    address,
    vehicleNumber,
    status,
    notes,
    createdBy,
    updatedBy,
    createdAt,
    updatedAt,
    deletedAt,
  }) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.nicNumber = nicNumber;
    this.phone = phone;
    this.email = email;
    this.licenseNumber = licenseNumber;
    this.licenseExpiry = licenseExpiry;
    this.address = address;
    this.vehicleNumber = vehicleNumber;
    this.status = status;
    this.notes = notes;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  isAvailable() {
    return this.status === 'active' && !this.deletedAt;
  }

  hasLicenseExpired(referenceDate = new Date()) {
    return new Date(this.licenseExpiry).getTime() < referenceDate.getTime();
  }
}

module.exports = Driver;
