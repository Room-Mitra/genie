import * as roomRepo from '#repositories/Room.repository.js';
import * as userRepo from '#repositories/User.repository.js';
import * as orderRepo from '#repositories/Order.repository.js';
import { orderResponse } from '#presenters/order.js';
import { minutesAhead } from '#common/timestamp.helper.js';
import { OrderStatus } from '#Constants/statuses.js';

const MIN_ORDER_SCHEDULED_MINUTES = 45;

export async function placeOrder({
  cart,
  hotelId,
  roomId,
  requestId,
  bookingId,
  guestUserId,
  estimatedTimeOfFulfillment,
}) {
  const { items, instructions, scheduledAt } = cart;

  let status = OrderStatus.PENDING;
  let statusType = 'ACTIVE';

  if (scheduledAt && minutesAhead(scheduledAt) > MIN_ORDER_SCHEDULED_MINUTES) {
    status = OrderStatus.SCHEDULED;
    statusType = 'UPCOMING';
  }

  const order = {
    entityType: 'ORDER',
    hotelId,
    roomId,
    requestId,
    bookingId,
    guestUserId,

    items,
    instructions,
    status,
    statusType,
    scheduledAt,
    estimatedTimeOfFulfillment,
  };

  return await orderRepo.createOrder({ order });
}

export async function listOrdersByStatusType({ hotelId, statusType, limit, nextToken }) {
  if (!hotelId || !statusType) throw new Error('need hotelId and statusType to list orders');

  if (!['inactive', 'active', 'upcoming'].includes(statusType.toLowerCase())) {
    throw new Error('invalid status type to list orders');
  }

  const orders = await orderRepo.queryRequestsByStatusType({
    hotelId,
    statusType,
    limit,
    nextToken,
  });

  const rooms = await roomRepo.queryAllRooms({ hotelId });
  const roomMap = new Map(rooms.map((room) => [room.roomId, room]));

  const guestUserIds = orders?.items?.map((b) => b.guestUserId);
  const guestUsers = await userRepo.getUsersByIds(guestUserIds);
  const guestUsersMap = new Map(guestUsers.map((user) => [user.userId, user]));

  const getRoom = (room) =>
    room && {
      type: room.type,
      floor: room.floor,
      number: room.number,
      roomId: room.roomId,
    };

  const getUser = (user) =>
    user && {
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.userId,
      mobileNumber: user.mobileNumber,
    };

  return {
    ...orders,
    items: orders?.items?.map((b) => ({
      ...orderResponse(b),
      room: getRoom(roomMap.get(b.roomId)),
      guest: getUser(guestUsersMap.get(b.guestUserId)),
    })),
  };
}
