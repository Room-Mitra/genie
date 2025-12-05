import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from './Email/Email.service.js';
import { getOtp, saveOTP, deleteOtp } from '#repositories/Otp.repository.js';

const OTP_TTL_SECONDS = 10 * 60; // 5 minutes

const TOKEN_EXPIRES_IN_MINUTES = 30;

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY env var is required');
}

/**
 * Generate a 5 digit numeric OTP as a string.
 */
function generateOtp() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export async function generateOtpForEmail(email, name, language, purpose, hotelId) {
  const code = generateOtp();
  const now = Math.floor(Date.now() / 1000); // seconds
  const ttl = now + OTP_TTL_SECONDS;

  await saveOTP(email, name, language, code, ttl, purpose, hotelId);

  await sendVerificationEmail({
    to: email,
    name,
    code,
  });
}

export async function generateOtpForSMS(phone, name, language, purpose, hotelId) {
  const code = generateOtp();
  const now = Math.floor(Date.now() / 1000); // seconds
  const ttl = now + OTP_TTL_SECONDS;

  await saveOTP(phone, name, language, code, ttl, purpose, hotelId);

  // await sendVerificationEmail({
  //   to: "prabhu.adithya@gmail.com",//phone,
  //   name,
  //   code,
  // });
}

// This function returns a short lived JWT if OTP is valid
export async function verifyOtpForEmail(email, code, purpose, hotelId) {
  const record = await getOtp(email, code, purpose, hotelId);

  if (!record) {
    const e = new Error('Invalid code for email');
    e.code = 'INVALID_CODE';
    throw e;
  }

  const now = Math.floor(Date.now() / 1000);

  if (record.ttl && record.ttl < now) {
    // Expired based on TTL
    // Optionally clean up

    await deleteOtp(email, code, purpose);

    const e = new Error('Code has expired');
    e.code = 'CODE_EXPIRED';
    throw e;
  }

  // OTP is valid, delete it so it cannot be reused
  await deleteOtp(email, code, purpose);

  // Create short lived JWT for this email
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    sub: email,
    name: record.name,
    language: record.language,
    iat: nowSec,
    hotelId,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: `${TOKEN_EXPIRES_IN_MINUTES}m` });
  return token;
}

export async function verifyOtp(phone, code, purpose, hotelId) {
  const record = await getOtp(phone, code, purpose, hotelId);

  if (!record) {
    const e = new Error('Invalid code for email');
    e.code = 'INVALID_CODE';
    throw e;
  }

  const now = Math.floor(Date.now() / 1000);

  if (record.ttl && record.ttl < now) {
    // Expired based on TTL
    // Optionally clean up

    await deleteOtp(phone, code, purpose);

    const e = new Error('Code has expired');
    e.code = 'CODE_EXPIRED';
    throw e;
  }

  // OTP is valid, delete it so it cannot be reused
  await deleteOtp(phone, code, purpose);

  // Create short lived JWT for this email
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    sub: phone,
    name: record.name,
    language: record.language,
    iat: nowSec,
    hotelId,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: `${TOKEN_EXPIRES_IN_MINUTES}m` });
  return token;
}
