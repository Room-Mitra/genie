import { toIsoString } from '#common/timestamp.helper.js';
import { RequestStatus } from '#Constants/statuses.js';
import { requestResponse } from '#presenters/request.js';
import { getMessagesByConversationIds } from '#repositories/Message.repository.js';
import * as requestRepo from '#repositories/Request.repository.js';
import * as roomRepo from '#repositories/Room.repository.js';
import * as staffRepo from '#repositories/Staff.repository.js';
import { ulid } from 'ulid';

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

export async function listRequestsByBooking({ bookingId }) {
  const requests = await requestRepo.queryRequestsForBooking({ bookingId });
  return {
    items: requests,
    count: requests.length,
  };
}

export async function createRequest(requestData) {
  const {
    hotelId,
    roomId,
    bookingId,
    deviceId,
    department,
    requestType,
    conversationId,
    guestUserId,
  } = requestData;

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
    conversationId,
    guestUserId,
    status: RequestStatus.UNACKNOWLEDGED,
  };

  return await requestRepo.createRequest(request);
}

export async function listRequests({ hotelId, statuses, limit, nextToken }) {
  if (!hotelId) throw new Error('need hotelId to list requests');

  statuses?.forEach((s) => {
    if (!['unacknowledged', 'in_progress', 'delayed', 'completed'].includes(s))
      throw new Error('invalid status to list requests');
  });

  const requests = await requestRepo.queryRequestsForHotel({ hotelId, statuses, limit, nextToken });

  const rooms = await roomRepo.queryAllRooms({ hotelId });
  const roomMap = new Map(rooms.map((room) => [room.roomId, room]));

  const staff = await staffRepo.queryStaffByHotelId(hotelId);
  const staffMap = new Map(staff.map((st) => [st.userId, st]));

  const conversationIds = requests?.items?.map((r) => r.conversationId).filter(Boolean);
  const conversationsMap = await getMessagesByConversationIds(conversationIds);

  const getRoom = (room) => ({
    type: room.type,
    floor: room.floor,
    number: room.number,
    roomId: room.roomId,
  });

  const getStaff = (st) =>
    st
      ? {
          firstName: st.firstName,
          lastName: st.lastName,
          department: st.department,
          roles: st.roles,
        }
      : null;

  const getConversation = (c) =>
    c && c.length
      ? {
          messages: c.map(({ content, createdAt, messageId, role }) => ({
            content,
            createdAt,
            role,
            messageId,
          })),
        }
      : null;

  return {
    ...requests,
    items: requests.items.map((r) => ({
      ...requestResponse(r),
      room: getRoom(roomMap.get(r.roomId)),
      assignedStaff: getStaff(staffMap.get(r.assignedStaffUserId)),
      conversation: getConversation(conversationsMap.get(r.conversationId)),
    })),
  };
}

export async function startRequest({
  requestId,
  hotelId,
  assignedStaffUserId,
  note,
  updatedByUserId,
}) {
  if (!requestId || !hotelId) throw new Error('requestId and hotelId needed to start request');

  const request = await requestRepo.getRequestById(requestId, hotelId);
  if (!request) throw new Error(`request doesn't exist for id:  ${requestId}`);

  if (!request.assignedStaffUserId && !assignedStaffUserId)
    throw new Error("require assignedStaffUserId for request that hasn't been auto assigned staff");

  return requestRepo.updateRequestStatusWithLog({
    request,
    toStatus: RequestStatus.IN_PROGRESS,
    assignedStaffUserId,
    updatedByUserId,
    note,
  });
}

export async function completeRequest({ requestId, hotelId, note, updatedByUserId }) {
  if (!requestId || !hotelId) throw new Error('requestId and hotelId needed to start request');

  const request = await requestRepo.getRequestById(requestId, hotelId);
  if (!request) throw new Error(`request doesn't exist for id:  ${requestId}`);

  return requestRepo.updateRequestStatusWithLog({
    request,
    toStatus: RequestStatus.COMPLETED,
    timeOfFulfillment: toIsoString(),
    updatedByUserId,
    note,
  });
}
