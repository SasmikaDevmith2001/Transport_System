const { toUserResponseDto } = require('./UserDto');

function toLoginResponseDto({ user, accessToken, refreshToken }) {
  return {
    user: toUserResponseDto(user),
    accessToken,
    refreshToken,
  };
}

module.exports = { toLoginResponseDto };
