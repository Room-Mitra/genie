export function requestResponse(request) {
  if (!request) return null;

  const {
    hotelId,
    roomId,
    requestId,
    department,
    requestType,
    estimatedTimeOfFulfillment,
    status,
    createdAt,
  } = request;

  return {
    hotelId,
    roomId,
    requestId,
    department,
    requestType,
    estimatedTimeOfFulfillment,
    status,
    createdAt,
  };
}
