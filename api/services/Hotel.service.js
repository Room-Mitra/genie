import { ulid } from 'ulid';
import * as hotelRepo from '#repositories/Hotel.repository.js';
import * as userRepo from '#repositories/User.repository.js';
import * as staffRepo from '#repositories/Staff.repository.js';

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
  return await hotelRepo.queryAllHotels({ limit, nextToken });
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

export async function addStaffToHotel(hotelId, userPayload) {
  // 1) Ensure hotel exists (latest version)
  const hotel = await hotelRepo.queryLatestHotelById(hotelId);
  if (!hotel) {
    const err = new Error('Hotel not found');
    err.status = 404;
    throw err;
  }

  // 2) Resolve userId (use provided or generate)
  const userId = userPayload.userId || ulid();

  // 3) Ensure user exists (create PROFILE row if missing)
  const existingUser = await userRepo.getUserProfileById(userId);
  if (!existingUser) {
    if (!userPayload.email || !userPayload.password || !userPayload.name) {
      const err = new Error('require email, password and name to create user');
      err.status = 400;
      throw err;
    }

    const user = {
      userId,
      name: userPayload.name || '',
      email: userPayload.email || '',
      mobileNumber: userPayload.mobileNumber || '',
      password: userPayload.password || 'Room$123', // default password
    };

    await userRepo.transactCreateUserWithEmailGuard({ user });
  }

  // 4) Create staff membership under the hotel (idempotent)
  const role = userPayload.role || 'STAFF';
  const staffItem = await staffRepo.addStaff({
    hotelId,
    userId,
    role,
  });

  return {
    message: 'Staff added to hotel',
    hotelId,
    userId,
    role,
    staff: staffItem,
  };
}
