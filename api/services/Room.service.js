import { roomResponse } from '#presenters/room.js';
import { queryBookings } from '#repositories/Booking.repository.js';
import { queryAllDevices } from '#repositories/Device.repository.js';
import { queryRequestsByStatusType } from '#repositories/Request.repository.js';
import * as roomRepo from '#repositories/Room.repository.js';
import * as userRepo from '#repositories/User.repository.js';

import { ulid } from 'ulid';
export async function addRoom({ hotelId, number, type, floor, description }) {
  if (!hotelId || !number || !type || !floor)
    throw new Error('Need hotelId, number, type and floor to add room');

  return roomRepo.createRoom({
    roomId: ulid(),
    entityType: 'ROOM',
    hotelId,
    number,
    type,
    floor,
    description,
  });
}

async function enrichRooms({ hotelId, rooms }) {
  const { items: activeBookings } = await queryBookings({ hotelId, status: 'active', limit: 500 });
  const roomActiveBookingsMap = new Map(activeBookings.map((booking) => [booking.roomId, booking]));

  const activeGuestUserIds = activeBookings?.map((b) => b.guest.userId);
  const activeGuestUsers = await userRepo.getUsersByIds(activeGuestUserIds);
  const activeGuestUsersMap = new Map(
    activeGuestUsers.map((user) => [
      user.userId,
      {
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user.userId,
        mobileNumber: user.mobileNumber,
      },
    ])
  );

  const { items: upcomingBookings } = await queryBookings({
    hotelId,
    status: 'upcoming',
    limit: 500,
  });
  const roomUpcomingBookingsMap = new Map(
    upcomingBookings
      .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
      .map((booking) => [booking.roomId, booking])
  );

  const devices = await queryAllDevices({ hotelId });
  const roomDevicesMap = new Map(
    devices
      .sort((a, b) => new Date(a.lastSeen) - new Date(b.lastSeen))
      .map((device) => [
        device.roomId,
        {
          deviceId: device.deviceId,
          lastSeen: device.lastSeen,
        },
      ])
  );

  const getBooking = (booking) =>
    booking
      ? {
          checkInTime: booking.checkInTime,
          checkOutTime: booking.checkOutTime,
          guest: activeGuestUsersMap.get(booking.guest.userId),
        }
      : null;

  const getStatus = (activeBooking, upcomingBooking) => {
    const now = new Date();

    // Case 1: Active booking
    if (activeBooking) {
      const { checkOutTime } = activeBooking;
      const diffMs = new Date(checkOutTime) - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours <= 6 && diffHours > 0) {
        return 'checkout_soon';
      }

      return 'occupied';
    }

    // Case 2: Upcoming booking
    if (upcomingBooking) {
      return 'upcoming';
    }

    // Case 3: No active or upcoming booking
    return 'empty';
  };

  const isDeviceOnline = (device, thresholdMinutes = 5) => {
    if (!device || !device.lastSeen) {
      return false;
    }

    const lastSeen = new Date(device.lastSeen);
    const now = new Date();
    const diffMs = now - lastSeen;
    const diffMinutes = diffMs / (1000 * 60);

    return diffMinutes <= thresholdMinutes;
  };

  return rooms.map((r) => {
    const activeBooking = getBooking(roomActiveBookingsMap.get(r.roomId));
    const upcomingBooking = getBooking(roomUpcomingBookingsMap.get(r.roomId));
    const status = getStatus(activeBooking, upcomingBooking);
    const device = roomDevicesMap.get(r.roomId);
    const deviceOnline = isDeviceOnline(device);

    const resp = {
      ...roomResponse(r),
      activeBooking,
      upcomingBooking,
      status,
      noDevice: true,
    };

    if (device) {
      resp['device'] = {
        ...device,
        online: deviceOnline,
      };
      resp['noDevice'] = false;
    }

    return resp;
  });
}

export async function listRooms({ hotelId }) {
  const rooms = await roomRepo.queryAllRooms({ hotelId });

  return {
    items: await enrichRooms({ hotelId, rooms }),
    count: rooms.length,
  };
}

export async function deleteRoom({ hotelId, roomId }) {
  /* 
  1. Ensure there are no active / upcoming bookings for room
  2. Ensure there are no active requests for room
  */

  const activeRequests = await queryRequestsByStatusType({ hotelId, statusType: 'ACTIVE', roomId });
  if (activeRequests.items.length) {
    throw new Error('cannot delete room with active requests associated');
  }

  const activeBookings = await queryBookings({ hotelId, status: 'active', roomId });
  if (activeBookings.items.length) {
    throw new Error('cannot delete room with active bookings associated');
  }

  const upcomingBookings = await queryBookings({ hotelId, status: 'upcoming', roomId });
  if (upcomingBookings.items.length) {
    throw new Error('cannot delete room with upcoming bookings associated');
  }

  await roomRepo.deleteRoom({ hotelId, roomId });
}
