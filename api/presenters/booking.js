export function bookingResponse(booking) {
  if (!booking) return null;

  const { bookingId, hotelId, checkInTime, checkOutTime, roomId, createdAt, updatedAt, guest } =
    booking;

  return {
    bookingId,
    hotelId,
    checkInTime,
    checkOutTime,
    roomId,
    createdAt,
    updatedAt,
    guest,
  };
}
