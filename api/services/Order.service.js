import { createOrder } from '#repositories/Order.repository.js';

export async function placeOrder({ cart, hotelId, requestId, bookingId, guestUserId }) {
  const order = {
    entityType: 'ORDER',
    hotelId,
    requestId,
    bookingId,
    guestUserId,

    cart,
  };

  return await createOrder({ order });
}
