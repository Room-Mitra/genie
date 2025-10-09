import {
  addGuest as addGuestToDB,
  getGuest as getGuestFromDB,
  updateGuest as updateGuestInDB,
} from './Guest.repository.js';

export const registerGuest = async (guest) => {
  addGuestToDB(guest);
};

export const getGuestDetails = async (guestId) => {
  return getGuestFromDB(guestId);
};

export const updateGuestData = async (guestId, guestData) => {
  await updateGuestInDB(guestId, guestData);
  console.log('GUEST RECORD UPDATED', guestId, guestData);
  return;
};

export const addBookingToGuest = async (guestId, bookingId) => {
  console.log('Adding Booking to Guest :: ', guestId);
  const guestData = await getGuestDetails(guestId);
  console.log('Guest Data :: ', guestData);
  guestData.bookings = guestData.bookings || [];
  guestData.bookings.push(bookingId);
  await updateGuestData(guestId, guestData);
};
