import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { authMiddleware, getUserId } from "../middleware/auth";
import { getCardForUser } from "../services/card.service";
import { getDeckForUser } from "../services/deck.service";
import { explainFlashcard } from "../services/llm.service";
import {
  getReviewQueueForUser,
  rateCardForUser,
  serializeRateResult,
  serializeReviewQueueItem,
} from "../services/review.service";

const rateSchema = z.object({
  rating: z.enum(["again", "hard", "good", "easy"]),
  durationMs: z.number().int().nonnegative().max(3_600_000).optional(),
});

const queueQuerySchema = z.object({
  deckId: z.string().uuid().optional(),
});

const explainLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI explain requests. Please try again later." },
});

function durationMsToMinutes(durationMs: number | undefined): number {
  if (durationMs === undefined) {
    return 0;
  }
  return Math.max(0, Math.round(durationMs / 60_000));
}

export const reviewsRouter = Router();

reviewsRouter.use(authMiddleware);

reviewsRouter.get("/queue", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { deckId } = queueQuerySchema.parse(req.query);
    const queue = await getReviewQueueForUser(userId, deckId);
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
    const card = await getCardForUser(userId, cardId);
    const deck = await getDeckForUser(userId, card.deckId);
    const result = await explainFlashcard({
      question: card.question,
      answer: card.answer,
      explanation: card.explanation,
      hint: card.hint,
      subject: deck.subject,
      deckTitle: deck.title,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post("/:cardId/rate", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { rating, durationMs } = rateSchema.parse(req.body);
    const minutesStudied = durationMsToMinutes(durationMs);
    const result = await rateCardForUser(
      userId,
      req.params.cardId,
      rating,
      minutesStudied,
    );
    res.json(serializeRateResult(result));
  } catch (error) {
    next(error);
  }
});
