import {
  getGuest as getGuestFromDB,
  updateGuest as updateGuestInDB,
} from '#repositories/Guest.repository.js';

export const getGuestDetails = async (guestId) => {
  return getGuestFromDB(guestId);
};

export const updateGuestData = async (guestId, guestData) => {
  await updateGuestInDB(guestId, guestData);
  return;
};
