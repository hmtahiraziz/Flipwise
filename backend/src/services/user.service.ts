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

/**
 * Pull latest name + avatar from Clerk into Neon.
 * Used by GET /me so profile photo updates show after upload.
 */
export async function syncUserProfileFromClerk(
  userId: string,
): Promise<AppUser> {
  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      clerkId: users.clerkId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) {
    throw new AppError(404, "User not found");
  }

  if (!row.clerkId) {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatarUrl,
    };
  }

  try {
    const clerkUser = await getClerkClient().users.getUser(row.clerkId);
    const syncedName =
      displayName(clerkUser.firstName, clerkUser.lastName) ??
      clerkUser.username ??
      row.name;
    const avatarUrl = clerkUser.imageUrl ?? null;

    if (syncedName === row.name && avatarUrl === row.avatarUrl) {
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        avatarUrl: row.avatarUrl,
      };
    }

    const [updated] = await db
      .update(users)
      .set({
        name: syncedName,
        avatarUrl,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
      });

    return (
      updated ?? {
        id: row.id,
        email: row.email,
        name: syncedName,
        avatarUrl,
      }
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    // Clerk outage — return last known Neon profile.
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatarUrl,
    };
  }
}

/**
 * Deletes the Neon user row (cascades decks, cards, reviews, streaks, sessions).
 * Idempotent: missing clerk id is a no-op success.
 */
export async function deleteUserDataByClerkId(
  clerkId: string,
): Promise<{ deleted: boolean; userId: string | null }> {
  const db = getDb();
  const [removed] = await db
    .delete(users)
    .where(eq(users.clerkId, clerkId))
    .returning({ id: users.id });

  return {
    deleted: Boolean(removed),
    userId: removed?.id ?? null,
  };
}

/**
 * In-app account deletion: wipe Neon first, then delete the Clerk user.
 * Clerk `user.deleted` webhook may also fire; that path is idempotent.
 */
export async function deleteAccountForUser(userId: string): Promise<void> {
  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      clerkId: users.clerkId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) {
    throw new AppError(404, "User not found");
  }

  await db.delete(users).where(eq(users.id, userId));

  if (!row.clerkId) {
    return;
  }

  try {
    await getClerkClient().users.deleteUser(row.clerkId);
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;

    // Already removed in Clerk — Neon wipe already succeeded.
    if (status === 404) {
      return;
    }

    console.error("[account-delete] Clerk user delete failed after Neon wipe", {
      userId,
      status,
    });
    throw new AppError(
      502,
      "Study data was deleted, but closing the auth account failed. Contact support.",
    );
  }
}
