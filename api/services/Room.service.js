import * as roomRepo from '#repositories/Room.repository.js';
import { ulid } from 'ulid';
export async function addRoom({ hotelId, number, type, floor, description }) {
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
    items: rooms.map(({ roomId, number, createdAt, description, hotelId, type, floor }) => ({
      roomId,
      number,
      createdAt,
      description,
      hotelId,
      type,
      floor,
    })),
    count: rooms.length,
  };
}
