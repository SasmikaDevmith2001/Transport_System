/**
 * Maps a domain User entity to a safe, transport-ready shape.
 * Never includes passwordHash.
 */
function toUserResponseDto(user) {
  if (!user) return null;
  return {
    id: user.id,
    roleId: user.roleId,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = { toUserResponseDto };
