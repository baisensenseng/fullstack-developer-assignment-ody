import { eq } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';
import { users } from '../db/schema';
import type { DbClient } from '../db/client';
import { hashPassword, verifyPassword } from './password';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Description: Implements toAuthUser.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function toAuthUser(user: typeof users.$inferSelect): AuthUser {
  return { id: user.id, name: user.name, email: user.email };
}

/**
 * Description: Implements signAuthToken.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function signAuthToken(user: AuthUser, secret: string) {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret));
}

/**
 * Description: Implements getUserFromToken.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function getUserFromToken(db: DbClient, token: string, secret: string) {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(secret));
    const userId = verified.payload.sub;
    if (!userId) return null;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user ? toAuthUser(user) : null;
  } catch {
    return null;
  }
}

/**
 * Description: Implements registerUser.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function registerUser(db: DbClient, secret: string, input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) throw new Error('EMAIL_ALREADY_REGISTERED');

  const [createdUser] = await db
    .insert(users)
    .values({ name: input.name.trim(), email, passwordHash: await hashPassword(input.password) })
    .returning();

  if (!createdUser) throw new Error('USER_CREATE_FAILED');

  const user = toAuthUser(createdUser);
  return { user, token: await signAuthToken(user, secret) };
}

/**
 * Description: Implements loginUser.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function loginUser(db: DbClient, secret: string, input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const [userRecord] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!userRecord) throw new Error('INVALID_CREDENTIALS');

  const validPassword = await verifyPassword(input.password, userRecord.passwordHash);
  if (!validPassword) throw new Error('INVALID_CREDENTIALS');

  const user = toAuthUser(userRecord);
  return { user, token: await signAuthToken(user, secret) };
}
