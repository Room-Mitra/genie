export function roomResponse(room) {
  if (!room) return null;
  const { roomId, number, createdAt, description, hotelId, type, floor } = room;

  return {
    roomId,
    number,
    createdAt,
    description,
    hotelId,
    type,
    floor,
  };
}
