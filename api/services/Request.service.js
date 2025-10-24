import { toIsoString } from '#common/timestamp.helper.js';
import { requestResponse } from '#presenters/request.js';
import * as requestRepo from '#repositories/Request.repository.js';
import * as roomRepo from '#repositories/Room.repository.js';
import { ulid } from 'ulid';

export async function listRequestsByBooking({ bookingId }) {
  const requests = await requestRepo.queryRequestsForBooking({ bookingId });
  return {
    items: requests,
    count: requests.length,
  };
}

const minsToFulfillByDepartment = {
  house_keeping: () => {
    const { min, max } = { min: 25, max: 35 };
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  room_service: () => {
    const { min, max } = { min: 35, max: 45 };
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  front_office: () => {
    const { min, max } = { min: 5, max: 10 };
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  concierge: () => {
    const { min, max } = { min: 10, max: 20 };
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  facilities: () => {
    const { min, max } = { min: 20, max: 40 };
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  general_enquiry: () => {
    const { min, max } = { min: 3, max: 5 };
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

export async function createRequest(requestData) {
  const { hotelId, roomId, bookingId, deviceId, department, requestType } = requestData;

  const minsToFulfillFn = minsToFulfillByDepartment?.[department];
  if (!minsToFulfillFn) {
    throw new Error(`unknown department ${department}`);
  }

  const now = new Date();
  const estimatedTimeOfFulfillment = toIsoString(
    now.setMinutes(now.getMinutes() + minsToFulfillFn())
  );

  const request = {
    entityType: 'REQUEST',
    requestId: ulid(),
    estimatedTimeOfFulfillment,
    department: department,
    requestType: requestType,
    hotelId,
    roomId,
    deviceId,
    bookingId,
    status: 'unacknowledged',
  };

  return await requestRepo.createRequest(request);
}

export async function listRequests({ hotelId, statuses, limit, nextToken }) {
  if (!hotelId) throw new Error('need hotelId to list requests');
  console.log(statuses);

  statuses?.forEach((s) => {
    if (!['unacknowledged', 'in_progress', 'delayed', 'completed'].includes(s))
      throw new Error('invalid status to list requests');
  });

  const requests = await requestRepo.queryRequestsForHotel({ hotelId, statuses, limit, nextToken });

  const rooms = await roomRepo.queryAllRooms({ hotelId });
  const roomMap = new Map(rooms.map((room) => [room.roomId, room]));

  const getRoom = (room) => ({
    type: room.type,
    floor: room.floor,
    number: room.number,
    roomId: room.roomId,
  });

  return {
    ...requests,
    items: requests.items.map((r) => ({
      ...requestResponse(r),
      room: getRoom(roomMap.get(r.roomId)),
    })),
  };
}
