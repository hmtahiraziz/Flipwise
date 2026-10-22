import { Router } from "express";
import { Webhook } from "svix";
import { getEnv } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { deleteUserDataByClerkId } from "../services/user.service";
import {
  markWebhookProcessed,
  wasWebhookProcessed,
} from "../services/webhook.service";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id?: string;
  };
};

export const webhooksRouter = Router();

/**
 * Clerk → Svix webhooks. Mounted with express.raw so the signature covers the
 * exact request body bytes.
 */
webhooksRouter.post("/clerk", async (req, res, next) => {
  try {
    const secret = getEnv().CLERK_WEBHOOK_SECRET;
    if (!secret) {
      throw new AppError(
        503,
        "Clerk webhooks are not configured (CLERK_WEBHOOK_SECRET)",
      );
    }

    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];

    if (
      typeof svixId !== "string" ||
      typeof svixTimestamp !== "string" ||
      typeof svixSignature !== "string"
    ) {
      throw new AppError(400, "Missing Svix signature headers");
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : null;

    if (!rawBody) {
      throw new AppError(400, "Webhook body must be raw JSON bytes");
    }

    const wh = new Webhook(secret);
    let event: ClerkWebhookEvent;
    try {
      event = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch {
      throw new AppError(400, "Invalid webhook signature");
    }

    if (await wasWebhookProcessed(svixId)) {
      res.json({ ok: true, duplicate: true });
      return;
    }

    if (event.type === "user.deleted") {
      const clerkUserId = event.data?.id;
      if (!clerkUserId || typeof clerkUserId !== "string") {
        throw new AppError(400, "user.deleted payload missing data.id");
      }

      await deleteUserDataByClerkId(clerkUserId);
    }

    // Mark after successful handling so a failed wipe can be retried by Svix.
    const recorded = await markWebhookProcessed(
      svixId,
      "clerk",
      event.type ?? "unknown",
    );

    res.json({ ok: true, duplicate: !recorded });
  } catch (error) {
    next(error);
  }
});
