import { ulid } from 'ulid';
import * as hotelRepo from '#repositories/Hotel.repository.js';
import * as userRepo from '#repositories/User.repository.js';
import * as staffRepo from '#repositories/Staff.repository.js';

import { hashPassword } from './User.service.js';
import { hasAnyRole } from '#common/auth.helper.js';
import { HotelRole } from '#Constants/roles.js';
import S3 from '#clients/S3.client.js';
import { amenityOrConciergeResponse } from '#presenters/amenity.js';
import { S3_ASSET_BUCKET, S3_PUBLIC_BASE_URL } from '#Constants/S3.constants.js';
import { hotelResponse } from '#presenters/hotel.js';
import { queryRequestsByStatusType } from '#repositories/Request.repository.js';

const ALLOWED_UPDATE_FIELDS = ['name', 'address', 'contactEmail', 'contactPhone'];

export async function getHotelById(hotelId) {
  const item = await hotelRepo.queryLatestHotelById(hotelId);
  return hotelResponse(item) || null;
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

export async function removeStaffFromHotel(hotelId, userId) {
  // 3) Ensure user exists (create PROFILE row if missing)
  let user = await userRepo.getUserProfileById(userId);

  if (user?.hotelId !== hotelId) {
    throw new Error(`user ${userId} doesn't belong to hotel ${hotelId}`);
  }

  const activeRequests = await queryRequestsByStatusType({
    hotelId,
    statusType: 'ACTIVE',
    assignedStaffUserId: userId,
  });

  if (activeRequests.count) {
    throw new Error(`can't delete user with active requests assigned to them`);
  }

  await staffRepo.removeHotelFromUser({ user });
}

export async function addAmenityOrConcierge({
  hotelId,
  title,
  description,
  headerImage,
  entityType,
}) {
  if (!hotelId || !title || !description || !headerImage || !entityType) {
    throw new Error(
      'require hotelId, title, description, image and type to create amenity or concierge service'
    );
  }

  const originalName = headerImage.originalname;
  const ext = originalName && originalName.includes('.') ? originalName.split('.').pop() : 'bin';
  const key = [hotelId, entityType, `${ulid()}.${ext}`].join('/');

  await S3.upload({
    Bucket: S3_ASSET_BUCKET,
    Key: key,
    Body: headerImage.buffer,
    ContentType: headerImage.mimetype,
  }).promise();

  const imageUrl = `${S3_PUBLIC_BASE_URL}/${encodeURI(key)}`;

  const idFields = {
    AMENITY: 'amenityId',
    CONCIERGE: 'serviceId',
  };

  const timeId = ulid();
  const entity = {
    hotelId,
    title,
    description,
    headerImage: {
      url: imageUrl,
    },
    entityType,
  };

  entity[idFields[entityType]] = timeId;

  const res = await hotelRepo.putAmenityOrConcierge(entity);
  return amenityOrConciergeResponse(res);
}

export async function listAmenities({ hotelId }) {
  const amenities = await hotelRepo.queryHotelMeta({
    hotelId,
    entityType: 'AMENITY',
  });
  return {
    items: amenities.map(amenityOrConciergeResponse),
    count: amenities.length,
  };
}

export async function deleteAmenity({ hotelId, amenityId }) {
  return hotelRepo.deleteHotelMeta({ hotelId, id: amenityId, entityType: 'AMENITY' });
}

export async function listConciergeServices({ hotelId }) {
  const concierge = await hotelRepo.queryHotelMeta({
    hotelId,
    entityType: 'CONCIERGE',
  });
  return {
    items: concierge.map(amenityOrConciergeResponse),
    count: concierge.length,
  };
}

export async function deleteConciergeService({ hotelId, serviceId }) {
  return hotelRepo.deleteHotelMeta({ hotelId, id: serviceId, entityType: 'CONCIERGE' });
}
