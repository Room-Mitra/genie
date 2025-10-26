export function userResponse(user) {
  if (!user) return null;
  const {
    roles,
    userId,
    createdAt,
    firstName,
    lastName,
    email,
    mobileNumber,
    hotelId,
    department,
    reportingToUserId,
  } = user;
  return {
    firstName,
    lastName,
    userId,
    createdAt,
    email,
    mobileNumber,
    hotelId,
    department,
    roles,
    reportingToUserId,
  };
}
