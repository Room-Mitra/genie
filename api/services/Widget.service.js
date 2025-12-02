import crypto from 'crypto';
import * as hotelService from '#services/Hotel.service.js';

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY env var is required');
}

export async function getWebVoiceAgentWidgetSignatures({ hotelId }) {
  const hotel = await hotelService.getHotelById(hotelId);
  if (!hotel) {
    const e = new Error('Hotel not found');
    e.code = 'HOTEL_NOT_FOUND';
    throw e;
  }

  const signatures = [];
  for (const allowedDomain of hotel.allowedDomain || []) {
    signatures.push({
      allowedDomain,
      signature: sign(hotelId, allowedDomain),
    });
  }

  return signatures;
}

function sign(hotelId, domain) {
  const data = `${hotelId}:${domain}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
}
