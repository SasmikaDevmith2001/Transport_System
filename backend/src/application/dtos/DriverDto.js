function toDriverResponseDto(driver) {
  if (!driver) return null;
  return {
    id: driver.id,
    userId: driver.userId,
    firstName: driver.firstName,
    lastName: driver.lastName,
    fullName: driver.fullName,
    nicNumber: driver.nicNumber,
    phone: driver.phone,
    email: driver.email,
    licenseNumber: driver.licenseNumber,
    licenseExpiry: driver.licenseExpiry,
    address: driver.address,
    vehicleNumber: driver.vehicleNumber,
    status: driver.status,
    notes: driver.notes,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt,
  };
}

module.exports = { toDriverResponseDto };
