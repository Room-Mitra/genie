import { bookingResponse } from './booking.js';

export function roomResponse(room) {
  if (!room) return null;
  const { roomId, number, createdAt, description, hotelId, type, floor, booking } = room;

  return {
    roomId,
    number,
    createdAt,
    description,
    hotelId,
    type,
    floor,
    booking: bookingResponse(booking),
  };
}
