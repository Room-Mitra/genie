import {
  getGuest as getGuestFromDB,
  updateGuest as updateGuestInDB,
} from '#repositories/Guest.repository.js';
import * as UserRepo from '#repositories/User.repository.js';
import { ulid } from 'ulid';

export const registerGuest = async (guest) => {
  const userId = guest.userId || ulid();

  const newGuest = {
    entityType: 'USER',
    userId,
    firstName: guest.firstName || '',
    lastName: guest.lastName || '',
    email: guest.email || '',
    mobile: guest.mobile || '',
    roles: ['GUEST'],
  };

  await UserRepo.transactCreateUserWithMobileGuard({ user: newGuest });

  return newGuest;
};

export const getGuestDetails = async (guestId) => {
  return getGuestFromDB(guestId);
};

export const updateGuestData = async (guestId, guestData) => {
  await updateGuestInDB(guestId, guestData);
  return;
};
