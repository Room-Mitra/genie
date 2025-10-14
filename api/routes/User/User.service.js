import bcrypt from 'bcrypt';
import { ulid } from 'ulid';
import * as UserRepo from './User.repository.js';
import { addUser, getUser } from './User.repository.js';

const SALT_ROUNDS = 12;

export async function signUp({ name, email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const userId = ulid();

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const now = new Date().toISOString();

  const userItem = {
    pk: `USER#${userId}`,
    sk: 'PROFILE',
    entityType: 'USER',
    userId,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  // This will also create a unique email registry item to prevent duplicates
  await UserRepo.transactCreateUserWithEmailGuard({ userItem });

  // Never return the hash

  const { passwordHash: _, ...safeUser } = userItem;
  return safeUser;
}

const ID_TYPE = 'LOGIN:';
const getId = ({ hotelId, username }) => `${ID_TYPE}${hotelId}:${username}`;

export const getUserDetails = async ({ hotelId, username }) => {
  const id = getId({ hotelId, username });
  const userData = await getUser(id);
  if (userData) {
    return userData;
  }
  return null;
};

export const addUserLogin = async (userData) => {
  const isUserExists = await getUserDetails(userData);
  if (isUserExists) {
    throw new Error(
      'User already exists: userName: ' + userData.username + ', hotelId: ' + userData.hotelId
    );
  }

  const { password, hotelId, username } = userData;
  const id = getId({ hotelId, username });
  const hashedPassword = await bcrypt.hash(password, 10);
  userData.password = hashedPassword;
  const isUserAdded = await addUser({ id, ...userData });
  if (!isUserAdded) {
    throw new Error('Failed to add user: userName: ' + username + ', hotelId: ' + hotelId);
  }
  return isUserAdded;
};
