import { addStaff as addStaffToDB, getStaff as getStaffFromDB } from './Staff.repository.js';

export const registerStaff = async (allStaffData, hotelId) => {
  const staffData = {
    id: hotelId,
    staffData: allStaffData,
  };
  return addStaffToDB(staffData);
};

export const getStaffDetails = async (hotelId) => {
  return getStaffFromDB(hotelId);
};

// const updateStaffData = async (guestId, guestData) => {
//     await updateStaffInDB(guestId, guestData);
//     console.log("STAFF RECORD UPDATED", guestId, guestData)
//     return
// }

// const deleteStaffData = async (guestId) => {
//     await deleteStaffInDB(guestId);
//     console.log("STAFF RECORD DELETED", guestId)
//     return
// }
