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
});

const queueQuerySchema = z.object({
  deckId: z.string().uuid().optional(),
});

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
    const { rating } = rateSchema.parse(req.body);
    const result = await rateCardForUser(userId, req.params.cardId, rating);
    res.json(serializeRateResult(result));
  } catch (error) {
    next(error);
  }
});
