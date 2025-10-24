import { staffResponse } from '#presenters/user.js';
import * as staffRepo from '#repositories/Staff.repository.js';

export const listStaffForHotel = async (hotelId) => {
  const staff = await staffRepo.queryStaffByHotelId(hotelId);

  return {
    items: staff.map(staffResponse),
    count: staff.length || 0,
  };
};
