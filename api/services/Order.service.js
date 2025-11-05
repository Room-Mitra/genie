import * as roomRepo from '#repositories/Room.repository.js';
import * as userRepo from '#repositories/User.repository.js';
import * as orderRepo from '#repositories/Order.repository.js';
import { orderResponse } from '#presenters/order.js';
import { minutesAhead } from '#common/timestamp.helper.js';
import { OrderStatus } from '#Constants/statuses.constasnts.js';
import { validateCart } from './Cart.service.js';
import { getItemsOnMenu } from './Menu.service.js';

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
  const allItems = await getItemsOnMenu({ hotelId });

  const cartValidation = await validateCart({ hotelId, cart, allItems });
  if (cartValidation.errors.length) throw { errors: cartValidation.errors };

  const { items: cartItems, instructions, scheduledAt } = cart;

  let status = OrderStatus.PENDING;
  let statusType = 'ACTIVE';

  if (scheduledAt && minutesAhead(scheduledAt) > MIN_ORDER_SCHEDULED_MINUTES) {
    status = OrderStatus.SCHEDULED;
    statusType = 'UPCOMING';
  }

  const getOrderItem = (item, quantity) => ({
    itemId: item.itemId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity,
    total: Number(Number(item.unitPrice) * quantity).toFixed(2),
    image: item.image,
  });

  const orderItems = [];
  const itemsMap = new Map(allItems.map((i) => [i.itemId, i]));
  for (const cartItem of cartItems) {
    const item = itemsMap.get(cartItem.itemId);
    orderItems.push(getOrderItem(item, cartItem.quantity));
  }

  const order = {
    entityType: 'ORDER',
    hotelId,
    roomId,
    requestId,
    bookingId,
    guestUserId,

    items: orderItems,
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

  const orders = await orderRepo.queryOrdersByStatusType({
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
