import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { webhookEvents } from "../db/schema";

export async function wasWebhookProcessed(eventId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(eq(webhookEvents.id, eventId))
    .limit(1);
  return Boolean(row);
}

/**
 * Records a processed webhook id. Returns false if the id was already stored
 * (concurrent duplicate).
 */
export async function markWebhookProcessed(
  eventId: string,
  source: string,
  eventType: string,
): Promise<boolean> {
  const db = getDb();
  const inserted = await db
    .insert(webhookEvents)
    .values({
      id: eventId,
      source,
      eventType,
    })
    .onConflictDoNothing()
    .returning({ id: webhookEvents.id });

  return inserted.length > 0;
}
