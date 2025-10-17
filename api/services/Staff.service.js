import * as staffRepo from '#repositories/Staff.repository.js';

export const registerStaff = async (allStaffData, hotelId) => {
  const staffData = {
    id: hotelId,
    staffData: allStaffData,
  };
  return staffRepo.addStaff(staffData);
};

export const listStaffForHotel = async (hotelId, { limit, nextToken }) => {
  return staffRepo.queryStaffByHotelId(hotelId, { limit, nextToken });
};
