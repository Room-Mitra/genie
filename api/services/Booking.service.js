import { ulid } from 'ulid';
import * as bookingRepo from '#repositories/Booking.repository.js';
import * as userRepo from '#repositories/User.repository.js';
import * as roomRepo from '#repositories/Room.repository.js';
import { toIsoString } from '#common/timestamp.helper.js';
import { bookingResponse } from '#presenters/booking.js';
import { userResponse } from '#presenters/user.js';

function parseAndValidateTimes(checkInTime, checkoutTime) {
  const start = new Date(checkInTime);
  const end = new Date(checkoutTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const err = new Error('Invalid date format. Use ISO strings.');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (end <= start) {
    const err = new Error('checkoutTime must be after checkInTime');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  return { startIso: start.toISOString(), endIso: end.toISOString() };
}

export async function createBooking(payload) {
  const { roomId, checkInTime, checkOutTime, guest, hotelId } = payload;

  const { startIso, endIso } = parseAndValidateTimes(checkInTime, checkOutTime);

  // Ensure or create guest by mobile
  const mobileNumber = String(guest.mobileNumber).trim();
  let guestUser = await userRepo.getMobileRegistryByMobile(mobileNumber);

  if (!guestUser) {
    const userId = ulid();
    const newUser = {
      userId,
      entityType: 'USER',
      firstName: guest.firstName || '',
      lastName: guest.lastName || '',
      mobileNumber: mobileNumber,
      roles: ['guest'],
    };
    await userRepo.transactCreateUserWithMobileGuard({ user: newUser });
    guestUser = newUser;
  }

  // Check for overlapping bookings for the room
  const hasOverlap = await bookingRepo.existsOverlappingBooking({
    roomId,
    checkInTime: startIso,
    checkOutTime: endIso,
  });

  if (hasOverlap) {
    const err = new Error('Overlapping booking');
    err.code = 'BOOKING_OVERLAP';
    throw err;
  }

  // Create booking
  const bookingId = ulid();
  const nowIso = toIsoString();

  const bookingItem = {
    bookingId,
    entityType: 'BOOKING',
    roomId,
    hotelId,

    checkInTime: startIso,
    checkOutTime: endIso,
    guest: {
      userId: guestUser.userId,
      firstName: guestUser.firstName,
      lastName: guestUser.lastName,
      mobileNumber: guestUser.mobileNumber,
    },
    status: 'CONFIRMED',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await bookingRepo.createBooking(bookingItem);

  return bookingItem;
}

export async function getBookingById({ hotelId, bookingId }) {
  return bookingResponse(await bookingRepo.queryLatestBookingById({ hotelId, bookingId }));
}

export async function listBookings({ hotelId, status, limit, nextToken }) {
  const bookings = await bookingRepo.queryBookings({ hotelId, status, limit, nextToken });

  const rooms = await roomRepo.queryAllRooms({ hotelId });
  const roomMap = new Map(rooms.map((room) => [room.roomId, room]));

  const guestUserIds = bookings?.items?.map((b) => b.guest.userId);
  const guestUsers = await userRepo.getUsersByIds(guestUserIds);
  const guestUsersMap = new Map(guestUsers.map((user) => [user.userId, user]));

  const getRoom = (room) => ({
    type: room.type,
    floor: room.floor,
    number: room.number,
    roomId: room.roomId,
  });

  const getUser = (user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    userId: user.userId,
    mobileNumber: user.mobileNumber,
  });

  return {
    ...bookings,
    items: bookings?.items?.map((b) => ({
      ...bookingResponse(b),
      room: getRoom(roomMap.get(b.roomId)),
      guest: getUser(guestUsersMap.get(b.guest.userId)),
    })),
  };
}

export async function getActiveBookingForRoom({ roomId }) {
  const booking = await bookingRepo.getActiveBookingForRoom({ roomId });

  if (booking) {
    const guest = await userRepo.getUserProfileById(booking.guest.userId);
    booking.guest = userResponse(guest);
  }

  return bookingResponse(booking);
}
