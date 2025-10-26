import { userResponse } from '#presenters/user.js';
import * as staffRepo from '#repositories/Staff.repository.js';

export const listStaffForHotel = async (hotelId) => {
  const staff = await staffRepo.queryStaffByHotelId(hotelId);

  return {
    items: staff.map(userResponse),
    count: staff.length || 0,
  };
};
