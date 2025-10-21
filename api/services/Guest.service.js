import {
  addGuest as addGuestToDB,
  getGuest as getGuestFromDB,
  updateGuest as updateGuestInDB,
} from '#repositories/Guest.repository.js';

export const registerGuest = async (guest) => {
  addGuestToDB(guest);
};

export const getGuestDetails = async (guestId) => {
  return getGuestFromDB(guestId);
};

export const updateGuestData = async (guestId, guestData) => {
  await updateGuestInDB(guestId, guestData);
  return;
};

export const addBookingToGuest = async (guestId, bookingId) => {
  const guestData = await getGuestDetails(guestId);
  guestData.bookings = guestData.bookings || [];
  guestData.bookings.push(bookingId);
  await updateGuestData(guestId, guestData);
};
