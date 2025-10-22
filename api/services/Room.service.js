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

export async function listRooms({ hotelId, limit, nextToken }) {
  const rooms = await roomRepo.queryAllRooms({ hotelId, limit, nextToken });
  return {
    items: rooms,
    count: rooms.length,
  };
}
