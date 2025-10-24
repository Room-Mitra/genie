export function bookingResponse(booking) {
  if (!booking) return null;

  const { bookingId, checkInTime, checkOutTime, roomId, createdAt, updatedAt, guest } = booking;

  return {
    bookingId,
    checkInTime,
    checkOutTime,
    roomId,
    createdAt,
    updatedAt,
    guest,
  };
}
