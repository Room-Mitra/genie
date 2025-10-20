import * as staffRepo from '#repositories/Staff.repository.js';

export const listStaffForHotel = async (hotelId, { limit, nextToken }) => {
  return staffRepo.queryStaffByHotelId(hotelId, { limit, nextToken });
};
