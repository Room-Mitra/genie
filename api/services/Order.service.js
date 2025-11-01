import { createOrder } from '#repositories/Order.repository.js';

export async function placeOrder({ cart, hotelId, roomId, requestId, bookingId, guestUserId }) {
  const order = {
    entityType: 'ORDER',
    hotelId,
    roomId,
    requestId,
    bookingId,
    guestUserId,

    cart,
  };

  return await createOrder({ order });
}
