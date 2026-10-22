import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { authMiddleware, getUserId } from "../middleware/auth";
import {
  createContentReport,
  REPORT_REASONS,
} from "../services/report.service";

const reportBodySchema = z.object({
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000).optional().nullable(),
  flashcardId: z.string().uuid().optional(),
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many reports. Please try again later." },
});

export const reportsRouter = Router();

reportsRouter.use(authMiddleware);

reportsRouter.post("/", reportLimiter, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = reportBodySchema.parse(req.body);
    const report = await createContentReport(userId, body);
    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
});
