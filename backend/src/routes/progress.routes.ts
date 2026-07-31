import { Router } from "express";
import { z } from "zod";
import { authMiddleware, getUserId } from "../middleware/auth";
import {
  getProgressHistoryForUser,
  getProgressSummaryForUser,
  serializeProgressHistory,
  serializeProgressSummary,
} from "../services/progress.service";

const historyQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
});

export const progressRouter = Router();

progressRouter.use(authMiddleware);

progressRouter.get("/summary", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const summary = await getProgressSummaryForUser(userId);
    res.json({ summary: serializeProgressSummary(summary) });
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/history", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { days } = historyQuerySchema.parse(req.query);
    const history = await getProgressHistoryForUser(userId, days);
    res.json(serializeProgressHistory(history));
  } catch (error) {
    next(error);
  }
});
