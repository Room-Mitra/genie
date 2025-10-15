import { ulid } from 'ulid';
import * as hotelRepo from '#repositories/Hotel.repository.js';

export async function addHotel({ name, address, city, country, contactEmail, contactPhone }) {
  const hotelId = ulid();
  const now = Date.now();

  const hotel = {
    hotelId,
    entityType: 'HOTEL',
    name,
    address: address || '',
    city: city || '',
    country: country || '',
    contactEmail: contactEmail || '',
    contactPhone: contactPhone || '',
    createdAt: now,
  };

  await hotelRepo.putHotel(hotel);

  return {
    message: 'Hotel added successfully',
    hotelId,
  };
}
