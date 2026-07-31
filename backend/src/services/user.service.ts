import { createClerkClient } from "@clerk/backend";
import { eq } from "drizzle-orm";
import { getEnv } from "../config/env";
import { getDb } from "../db";
import { users } from "../db/schema";
import { AppError } from "../middleware/errorHandler";

let clerkClient: ReturnType<typeof createClerkClient> | null = null;

export function getClerkClient() {
  if (!clerkClient) {
    clerkClient = createClerkClient({
      secretKey: getEnv().CLERK_SECRET_KEY,
    });
  }
  return clerkClient;
}

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

function displayName(
  firstName: string | null,
  lastName: string | null,
): string | null {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || null;
}

export async function findOrCreateUserFromClerk(
  clerkUserId: string,
): Promise<AppUser> {
  const db = getDb();

  const [existingByClerk] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.clerkId, clerkUserId))
    .limit(1);

  if (existingByClerk) {
    return existingByClerk;
  }

  const clerkUser = await getClerkClient().users.getUser(clerkUserId);
  const primaryEmail = clerkUser.emailAddresses.find(
    (entry) => entry.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress;

  if (!primaryEmail) {
    throw new AppError(400, "Clerk user has no primary email");
  }

  const syncedName =
    displayName(clerkUser.firstName, clerkUser.lastName) ??
    clerkUser.username ??
    null;
  const avatarUrl = clerkUser.imageUrl ?? null;

  const [existingByEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, primaryEmail.toLowerCase()))
    .limit(1);

  if (existingByEmail) {
    const [linked] = await db
      .update(users)
      .set({
        clerkId: clerkUserId,
        name: syncedName,
        avatarUrl,
      })
      .where(eq(users.id, existingByEmail.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
      });

    if (!linked) {
      throw new AppError(500, "Failed to link Clerk user");
    }
    return linked;
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkId: clerkUserId,
      email: primaryEmail.toLowerCase(),
      name: syncedName,
      avatarUrl,
      passwordHash: null,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
    });

  if (!created) {
    throw new AppError(500, "Failed to create user");
  }

  return created;
}

export async function getUserById(userId: string): Promise<AppUser | null> {
  const db = getDb();
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
}
