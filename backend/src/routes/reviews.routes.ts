import { Router } from "express";
import { z } from "zod";
import { authMiddleware, getUserId } from "../middleware/auth";
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
