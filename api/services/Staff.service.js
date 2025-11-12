import { userResponse } from '#presenters/user.js';
import * as staffRepo from '#repositories/Staff.repository.js';
import { getUserProfileById, updateUser } from '#repositories/User.repository.js';
import { updatePassword } from './User.service.js';

export const listStaffForHotel = async (hotelId) => {
  const staff = await staffRepo.queryStaffByHotelId(hotelId);

  return {
    items: staff.map(userResponse),
    count: staff.length || 0,
  };
};

export async function resetStaffPassword({ hotelId, staffUserId, password }) {
  if (!hotelId || !staffUserId || !password)
    throw new Error('need hotelId, staffUserId and password to reset password');

  const user = await getUserProfileById(staffUserId);
  if (!user) throw new Error('user not found');

  if (user.hotelId != hotelId)
    throw new Error(`cannot change password of user that doesn't belong to hotel`);

  await updatePassword(staffUserId, password);
}

const ALLOWED_UPDATE_FIELDS = [
  'firstName',
  'lastName',
  'mobileNumber',
  'department',
  'roles',
  'weeklyShifts',
  'reportingToUserId',
];

export async function updateStaffById(staffUserId, payload) {
  const updates = {};
  for (const f of ALLOWED_UPDATE_FIELDS) {
    if (payload[f] !== undefined) updates[f] = payload[f];
  }
  if (Object.keys(updates).length === 0) {
    const err = new Error('no updatable fields provided');
    err.status = 400;
    throw err;
  }

  const current = await getUserProfileById(staffUserId);
  if (!current) {
    const err = new Error('staff user not found');
    err.status = 404;
    throw err;
  }

  const updated = await updateUser(staffUserId, updates);
  return updated;
}
