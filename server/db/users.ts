import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "./index.js";
import { users } from "./schema.js";

const SALT_ROUNDS = 10;

/** A user as the rest of the server sees it: everything but the password hash. */
export type User = Omit<typeof users.$inferSelect, "passwordHash">;
/** What other members may see about a user. */
export type UserSummary = Pick<User, "id" | "displayName" | "isAdmin" | "createdAt">;

// Hashes must never leave this module, so every select names its columns.
const USER_COLUMNS = {
  id: users.id,
  email: users.email,
  displayName: users.displayName,
  isAdmin: users.isAdmin,
  createdAt: users.createdAt,
};
const SUMMARY_COLUMNS = {
  id: users.id,
  displayName: users.displayName,
  isAdmin: users.isAdmin,
  createdAt: users.createdAt,
};

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const findUserById = async (id: string): Promise<User | null> => {
  const [user] = await db.select(USER_COLUMNS).from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
};

export const findUserByDisplayName = async (displayName: string): Promise<User | null> => {
  const [user] = await db
    .select(USER_COLUMNS)
    .from(users)
    .where(eq(users.displayName, displayName))
    .limit(1);
  return user ?? null;
};

export const getUserSummary = async (id: string): Promise<UserSummary | null> => {
  const [user] = await db.select(SUMMARY_COLUMNS).from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
};

export const listUsers = (): Promise<UserSummary[]> =>
  db.select(SUMMARY_COLUMNS).from(users).orderBy(users.createdAt);

export type SignupConflict = "displayName" | "email";

/**
 * Which unique field an existing account already uses. Display name wins when
 * both clash, matching the order of the registration error messages.
 */
export const findSignupConflict = async (
  email: string,
  displayName: string,
): Promise<SignupConflict | null> => {
  const rows = await db
    .select({ email: users.email, displayName: users.displayName })
    .from(users)
    .where(or(eq(users.email, normalizeEmail(email)), eq(users.displayName, displayName)));
  if (rows.some((row) => row.displayName === displayName)) {
    return "displayName";
  }
  return rows.length > 0 ? "email" : null;
};

export interface NewUser {
  email: string;
  displayName: string;
  password: string;
  isAdmin?: boolean;
}

/** Hashes on the way in, so no caller can persist a plaintext password. */
export const createUser = async (input: NewUser): Promise<User> => {
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const [user] = await db
    .insert(users)
    .values({
      email: normalizeEmail(input.email),
      displayName: input.displayName,
      passwordHash,
      isAdmin: input.isAdmin ?? false,
    })
    .returning(USER_COLUMNS);
  if (!user) {
    throw new Error("Insert returned no row");
  }
  return user;
};

export type CredentialCheck =
  | { user: User; failure?: undefined }
  | { user?: undefined; failure: "email" | "password" };

export const checkCredentials = async (
  email: string,
  password: string,
): Promise<CredentialCheck> => {
  const [row] = await db
    .select({ ...USER_COLUMNS, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);
  if (!row) {
    return { failure: "email" };
  }
  const { passwordHash, ...user } = row;
  if (!(await bcrypt.compare(password, passwordHash))) {
    return { failure: "password" };
  }
  return { user };
};
