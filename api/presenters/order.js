export function orderResponse(order) {
  if (!order) return null;
  const {
    instructions,
    items,
    status,
    scheduledAt,
    createdAt,
    guestUserId,
    orderId,
    requestId,
    estimatedTimeOfFulfillment,
    timeOfFulfillment,
  } = order;

  return {
    orderId,
    requestId,
    guestUserId,
    status,
    instructions,
    items,
    scheduledAt,
    createdAt,
    estimatedTimeOfFulfillment,
    timeOfFulfillment,
  };
}
