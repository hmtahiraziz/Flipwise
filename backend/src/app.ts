import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { getEnv } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { cardsRouter, deckCardsRouter } from "./routes/cards.routes";
import { decksRouter } from "./routes/decks.routes";
import { progressRouter } from "./routes/progress.routes";
import { reviewsRouter } from "./routes/reviews.routes";

export function createApp() {
  const env = getEnv();
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? true : (env.CORS_ORIGIN ?? true),
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/decks", decksRouter);
  app.use("/api/decks/:deckId/cards", deckCardsRouter);
  app.use("/api/cards", cardsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/progress", progressRouter);

  app.use(errorHandler);

  return app;
}
