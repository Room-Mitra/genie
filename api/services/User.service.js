import bcrypt from 'bcrypt';
import { ulid } from 'ulid';
import * as UserRepo from '#repositories/User.repository.js';

const SALT_ROUNDS = 12;

export async function signUp({ firstName, lastName, email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const userId = ulid();

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = {
    entityType: 'USER',
    userId,
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: normalizedEmail,
    passwordHash,
  };

  // This will also create a unique email registry item to prevent duplicates
  await UserRepo.transactCreateUserWithEmailGuard({ user });

  // Never return the hash

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}
