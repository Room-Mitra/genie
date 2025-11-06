import { roomResponse } from '#presenters/room.js';
import { queryBookings } from '#repositories/Booking.repository.js';
import { queryRequestsByStatusType } from '#repositories/Request.repository.js';
import * as roomRepo from '#repositories/Room.repository.js';
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

export async function listRooms({ hotelId }) {
  const rooms = await roomRepo.queryAllRooms({ hotelId });

  return {
    items: rooms.map(roomResponse),
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
