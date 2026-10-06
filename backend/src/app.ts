import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { getEnv } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { cardsRouter, deckCardsRouter } from "./routes/cards.routes";
import { decksRouter } from "./routes/decks.routes";
import { legalRouter } from "./routes/legal.routes";
import { progressRouter } from "./routes/progress.routes";
import { reviewsRouter } from "./routes/reviews.routes";

function resolveCorsOrigin(
  corsOrigin: string | undefined,
  isProduction: boolean,
): boolean | string | string[] {
  if (!corsOrigin || corsOrigin.trim() === "" || corsOrigin.trim() === "*") {
    if (isProduction) {
      console.warn(
        "[cors] CORS_ORIGIN is '*' or unset in production; prefer a comma-separated allowlist",
      );
    }
    return true;
  }

  const allowlist = corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowlist.length === 0) {
    if (isProduction) {
      console.warn(
        "[cors] CORS_ORIGIN allowlist is empty in production; prefer a comma-separated allowlist",
      );
    }
    return true;
  }

  return allowlist.length === 1 ? allowlist[0]! : allowlist;
}

export function createApp() {
  const env = getEnv();
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          scriptSrc: ["'self'"],
        },
      },
    }),
  );
  app.use(
    cors({
      origin: resolveCorsOrigin(env.CORS_ORIGIN, isProduction),
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Public legal pages for Play Console and in-app HTTPS links.
  app.use(legalRouter);

  app.use("/api", apiLimiter);
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/decks", decksRouter);
  app.use("/api/decks/:deckId/cards", deckCardsRouter);
  app.use("/api/cards", cardsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/progress", progressRouter);

  app.use(errorHandler);

  return app;
}
