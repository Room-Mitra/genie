import { ulid } from 'ulid';
import * as hotelRepo from '#repositories/Hotel.repository.js';

const ALLOWED_UPDATE_FIELDS = ['name', 'address', 'contactEmail', 'contactPhone'];

export async function getHotelById(hotelId) {
  const item = await hotelRepo.queryLatestHotelById(hotelId);
  return item || null;
}

export async function addHotel({ name, address, contactEmail, contactPhone }) {
  const hotelId = ulid();
  const now = Date.now();

  const hotel = {
    hotelId,
    entityType: 'HOTEL',
    name,
    address: address || '',
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

export async function listHotels({ limit, nextToken }) {
  return await hotelRepo.scanHotels({ limit, nextToken });
}

export async function updateHotelById(hotelId, payload) {
  // pick only allowed fields
  const updates = {};
  for (const f of ALLOWED_UPDATE_FIELDS) {
    if (payload[f] !== undefined) updates[f] = payload[f];
  }
  if (Object.keys(updates).length === 0) {
    const err = new Error('No updatable fields provided');
    err.status = 400;
    throw err;
  }

  const current = await hotelRepo.queryLatestHotelById(hotelId);
  if (!current) {
    const err = new Error('Hotel not found');
    err.status = 404;
    throw err;
  }

  const updated = await hotelRepo.updateHotelByPkSk(current.pk, current.sk, updates);
  return updated;
}
