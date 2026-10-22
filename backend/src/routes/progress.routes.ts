import { Router } from "express";
import { z } from "zod";
import { authMiddleware, getUserId } from "../middleware/auth";
import {
  getProgressHistoryForUser,
  getProgressSummaryForUser,
  serializeProgressHistory,
  serializeProgressSummary,
} from "../services/progress.service";
import { parseOptionalTimeZone } from "../utils/dates";

const historyQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
  timeZone: z.string().trim().min(1).max(64).optional(),
});

const summaryQuerySchema = z.object({
  timeZone: z.string().trim().min(1).max(64).optional(),
});

export const progressRouter = Router();

progressRouter.use(authMiddleware);

progressRouter.get("/summary", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { timeZone: rawTz } = summaryQuerySchema.parse(req.query);
    const timeZone = parseOptionalTimeZone(rawTz);
    const summary = await getProgressSummaryForUser(userId, timeZone);
    res.json({ summary: serializeProgressSummary(summary) });
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/history", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { days, timeZone: rawTz } = historyQuerySchema.parse(req.query);
    const timeZone = parseOptionalTimeZone(rawTz);
    const history = await getProgressHistoryForUser(userId, days, timeZone);
    res.json(serializeProgressHistory(history));
  } catch (error) {
    next(error);
  }
});
