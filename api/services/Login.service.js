import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as UserRepo from '#repositories/User.repository.js';
import { hasAnyRole, isAdminUser } from '#common/auth.helper.js';
import { HotelRole } from '#Constants/roles.js';

// 240h = 10 days
const TOKEN_EXPIRES_IN_HOURS = 240;
const TOKEN_EXPIRES_IN_SECONDS = TOKEN_EXPIRES_IN_HOURS * 3600;

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error('SECRET_KEY env var is required');
}

export async function login({ email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  // 1) find the EMAIL_REGISTRY row to get userId
  const emailReg = await UserRepo.getEmailRegistryByEmail(normalizedEmail);
  if (!emailReg) {
    const e = new Error('Invalid email or password');
    e.name = 'UnauthorizedError';
    throw e;
  }

  // 2) fetch the user profile by userId
  const user = await UserRepo.getUserProfileById(emailReg.userId);
  if (!user || !user.passwordHash) {
    const e = new Error('Invalid email or password');
    e.name = 'UnauthorizedError';
    throw e;
  }

  // 3) verify password
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const e = new Error('Invalid email or password');
    e.name = 'UnauthorizedError';
    throw e;
  }

  // 4) authorization - only hotel staff or admins can login
  if (!isAdminUser(user) && (!user.hotelId || !hasAnyRole(user, Object.values(HotelRole)))) {
    const e = new Error("User not associated with hotel, or isn't admin");
    e.name = 'UnauthorizedError';
    throw e;
  }

  // 5) sign JWT
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    iat: nowSec,
    hotelId: user?.hotelId,
    groups: user?.groups,
    roles: user?.roles,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: `${TOKEN_EXPIRES_IN_HOURS}h` });

  // do not return hash
  const { passwordHash: _, ...safeUser } = user;

  return {
    token,
    expiresInSeconds: TOKEN_EXPIRES_IN_SECONDS,
    user: safeUser,
  };
}
