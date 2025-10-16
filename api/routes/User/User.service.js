import bcrypt from 'bcrypt';
import { ulid } from 'ulid';
import * as UserRepo from './User.repository.js';

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
