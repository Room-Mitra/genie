import { weeklyShiftsResponse } from './weeklyShifts.js';

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
    weeklyShifts,
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
    weeklyShifts: weeklyShiftsResponse(weeklyShifts),
  };
}
