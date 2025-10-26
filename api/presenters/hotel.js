export function hotelResponse(hotel) {
  if (!hotel) return null;

  const { name, contactPhone, contactEmail, address, hotelId, createdAt, updatedAt } = hotel;
  return {
    name,
    contactPhone,
    contactEmail,
    address,
    hotelId,
    createdAt,
    updatedAt,
  };
}
