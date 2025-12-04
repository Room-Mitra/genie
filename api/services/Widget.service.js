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
  for (const allowedDomain of hotel.allowedDomains || []) {
    signatures.push({
      allowedDomain,
      signature: sign(hotelId, allowedDomain),
    });
  }

  return signatures;
}

export async function initWidget({ hotelId, host, signature }) {
  // Look up hotel config
  const hotel = await hotelService.getHotelById(hotelId);

  if (!hotel) {
    const err = new Error('hotel not found');
    err.code = 'HOTEL_NOT_FOUND';
    throw err;
  }

  if (!hotel.allowedDomains.includes(host)) {
    const err = new Error('domain not allowed for this hotel');
    err.code = 'DOMAIN_NOT_ALLOWED';
    throw err;
  }

  // Verify signature
  const expectedSignature = sign(hotelId, host);
  if (expectedSignature !== signature) {
    const err = new Error('bad signature');
    err.code = 'BAD_SIGNATURE';
    throw err;
  }

  // All good. Return widget config.
  const widgetConfig = {
    hotelName: hotel.name,
    // anything else your widget needs
  };

  return widgetConfig;
}

function sign(hotelId, domain) {
  const data = `${hotelId}:${domain}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
}
