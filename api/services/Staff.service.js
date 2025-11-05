import { userResponse } from '#presenters/user.js';
import * as staffRepo from '#repositories/Staff.repository.js';
import { getUserProfileById } from '#repositories/User.repository.js';
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
