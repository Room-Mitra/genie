import { ulid } from 'ulid';
import * as hotelRepo from '#repositories/Hotel.repository.js';
import * as userRepo from '#repositories/User.repository.js';
import * as staffRepo from '#repositories/Staff.repository.js';

import { hashPassword } from './User.service.js';
import { hasAnyRole } from '#common/auth.helper.js';
import { HotelRole } from '#Constants/roles.js';
import S3 from '#clients/S3.js';
import { amenityResponse } from '#presenters/amenity.js';

const ALLOWED_UPDATE_FIELDS = ['name', 'address', 'contactEmail', 'contactPhone'];
const AMENITIES_S3_BUCKET = 'roommitra-assets-bucket';
const PUBLIC_BASE_URL = 'https://roommitra-assets-bucket.s3.ap-south-1.amazonaws.com';

export async function getHotelById(hotelId) {
  const item = await hotelRepo.queryLatestHotelById(hotelId);
  return item || null;
}

export async function addHotel({ name, address, contactEmail, contactPhone }) {
  const hotelId = ulid();

  const hotel = {
    hotelId,
    entityType: 'HOTEL',
    name,
    address: address || '',
    contactEmail: contactEmail || '',
    contactPhone: contactPhone || '',
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

  const normalizedEmail = String(userPayload.email).trim().toLowerCase();

  // 1) find the EMAIL_REGISTRY row to get userId
  const emailReg = await userRepo.getEmailRegistryByEmail(normalizedEmail);

  // 3) Ensure user exists (create PROFILE row if missing)
  let user = await userRepo.getUserProfileById(emailReg?.userId);
  if (!user) {
    if (
      !userPayload.email ||
      !userPayload.password ||
      !userPayload.firstName ||
      !userPayload.lastName
    ) {
      const err = new Error('require email, password and firstName, lastName to create user');
      err.status = 400;
      throw err;
    }

    const newUser = {
      userId: ulid(),
      entityType: 'USER',
      firstName: userPayload.firstName || '',
      lastName: userPayload.lastName || '',
      email: userPayload.email || '',
      mobileNumber: userPayload.mobileNumber || '',
      passwordHash: await hashPassword(userPayload.password || 'Room$123'), // default password
    };

    await userRepo.transactCreateUserWithEmailGuard({ user: newUser });
    user = newUser;
  }

  if (user?.hotelId || hasAnyRole(user, Object.values(HotelRole))) {
    const err = new Error('user already is a associated with a hotel');
    err.status = 400;
    throw err;
  }

  const updated = await staffRepo.addStaff({
    hotelId: hotelId,
    userId: user.userId,
    role: userPayload.role,
    department: userPayload.department,
    reportingToUserId: userPayload.reportingToUserId,
  });

  return updated;
}

export async function addAmenity({ hotelId, title, description, image }) {
  if (!hotelId || !title || !description || !image) {
    throw new Error('requier hotelId, title, description and image to create amenity');
  }

  const originalName = image.originalname;
  const ext = originalName && originalName.includes('.') ? originalName.split('.').pop() : 'bin';
  const key = [hotelId, 'amenities', `${ulid()}.${ext}`].join('/');

  const out = await S3.upload({
    Bucket: AMENITIES_S3_BUCKET,
    Key: key,
    Body: image.buffer,
    ContentType: image.mimetype,
  }).promise();

  const imageUrl = PUBLIC_BASE_URL ? `${PUBLIC_BASE_URL}/${encodeURI(key)}` : out.Location;

  const amenityId = ulid();
  const amenity = {
    amenityId,
    hotelId,
    title,
    description,
    image: {
      url: imageUrl,
    },
    entityType: 'AMENITY',
  };

  const res = await hotelRepo.putAmenity(amenity);
  return amenityResponse(res);
}

export async function listAmenities({ hotelId }) {
  const amenities = await hotelRepo.queryAllAmenities({ hotelId });
  return {
    items: amenities.map(amenityResponse),
    count: amenities.length,
  };
}

export async function deleteAmenity({ hotelId, amenityId }) {
  return hotelRepo.deleteAmenity({ hotelId, amenityId });
}
