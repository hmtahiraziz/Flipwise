import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { authMiddleware, getUserId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import {
  assertAiQuotaAvailable,
  consumeAiQuota,
} from "../services/aiQuota.service";
import { getCardForUser } from "../services/card.service";
import { getDeckForUser } from "../services/deck.service";
import { explainFlashcard } from "../services/llm.service";
import {
  getReviewQueueForUser,
  rateCardForUser,
  serializeRateResult,
  serializeReviewQueueItem,
} from "../services/review.service";
import { requireAiConsent } from "../utils/aiConsent";
import { parseOptionalTimeZone } from "../utils/dates";

const rateSchema = z.object({
  rating: z.enum(["again", "hard", "good", "easy"]),
  /** @deprecated Ignored for study minutes — kept for client compat. */
  durationMs: z.number().int().nonnegative().max(3_600_000).optional(),
  timeZone: z.string().trim().min(1).max(64).optional(),
  idempotencyKey: z.string().trim().min(8).max(64).optional(),
});

const explainBodySchema = z.object({
  aiConsent: z.union([z.literal(true), z.literal("true"), z.literal("1")]),
});

const queueQuerySchema = z.object({
  deckId: z.string().uuid().optional(),
  timeZone: z.string().trim().min(1).max(64).optional(),
});

const explainLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI explain requests. Please try again later." },
});

export const reviewsRouter = Router();

reviewsRouter.use(authMiddleware);

reviewsRouter.get("/queue", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { deckId, timeZone: rawTz } = queueQuerySchema.parse(req.query);
    const timeZone = parseOptionalTimeZone(rawTz);
    const queue = await getReviewQueueForUser(userId, deckId, timeZone);
    res.json({ queue: queue.map(serializeReviewQueueItem) });
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post("/:cardId/explain", explainLimiter, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const cardIdParam = req.params.cardId;
    const cardId = typeof cardIdParam === "string" ? cardIdParam : cardIdParam?.[0];
    if (!cardId) {
      res.status(400).json({ error: "Card id is required" });
      return;
    }
    explainBodySchema.parse(req.body ?? {});
    requireAiConsent(req.body?.aiConsent);
    const card = await getCardForUser(userId, cardId);
    const deck = await getDeckForUser(userId, card.deckId);
    // Check cap first; only increment after a successful explanation so
    // OpenAI failures do not burn the daily explain quota.
    await assertAiQuotaAvailable(userId, "explain");
    const result = await explainFlashcard({
      question: card.question,
      answer: card.answer,
      explanation: card.explanation,
      hint: card.hint,
      subject: deck.subject,
      deckTitle: deck.title,
    });
    try {
      await consumeAiQuota(userId, "explain");
    } catch (quotaError) {
      // Rare race after success — still return the explanation.
      if (!(quotaError instanceof AppError && quotaError.statusCode === 429)) {
        throw quotaError;
      }
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post("/:cardId/rate", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = rateSchema.parse(req.body);
    const timeZone = parseOptionalTimeZone(body.timeZone);
    const result = await rateCardForUser(userId, req.params.cardId, body.rating, {
      timeZone,
      idempotencyKey: body.idempotencyKey,
    });
    res.json(serializeRateResult(result));
  } catch (error) {
    next(error);
  }
});
