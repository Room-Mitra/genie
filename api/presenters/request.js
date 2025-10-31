export function requestResponse(request) {
  if (!request) return null;

  const {
    hotelId,
    roomId,
    requestId,
    department,
    requestType,
    estimatedTimeOfFulfillment,
    timeOfFulfillment,
    status,
    createdAt,
    conversationId,
    bookingId,
  } = request;

  return {
    hotelId,
    roomId,
    requestId,
    department,
    requestType,
    estimatedTimeOfFulfillment,
    timeOfFulfillment,
    status,
    createdAt,
    conversationId,
    bookingId,
  };
}
