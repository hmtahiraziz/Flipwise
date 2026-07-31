import { Router } from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { z } from "zod";
import { authMiddleware, getUserId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import {
  createCardForDeck,
  createCardsBulkForDeck,
  deleteCardForUser,
  listCardsForDeck,
  serializeFlashcard,
  updateCardForUser,
} from "../services/card.service";
import { getDeckForUser } from "../services/deck.service";
import {
  buildImportResult,
  extractTextFromPdf,
  extractTextFromUrl,
} from "../services/import.service";
import { generateFlashcards } from "../services/llm.service";

const cardBodySchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(2000),
  answer: z.string().trim().min(1, "Answer is required").max(4000),
  imageUrl: z.string().url().optional().nullable(),
});

const bulkCardsSchema = z.object({
  cards: z.array(cardBodySchema).min(1).max(50),
});

const generateSchema = z.object({
  sourceType: z.enum(["topic", "notes"]),
  content: z.string().trim().min(1, "Content is required").max(20000),
  count: z.coerce.number().int().min(3).max(30).default(10),
  tone: z
    .enum(["concise", "detailed", "child-friendly", "critical"])
    .default("concise"),
});

const urlImportSchema = z.object({
  url: z.string().url("Valid URL is required").max(2000),
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF files are supported"));
  },
});

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many generation requests. Please try again later." },
});

const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many import requests. Please try again later." },
});

export const deckCardsRouter = Router({ mergeParams: true });

function getDeckIdParam(req: { params: Record<string, string | string[] | undefined> }): string {
  const deckId = req.params.deckId;
  if (typeof deckId !== "string" || !deckId) {
    throw new AppError(400, "Deck id is required");
  }
  return deckId;
}

deckCardsRouter.use(authMiddleware);

deckCardsRouter.get("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const deckId = getDeckIdParam(req);
    const cards = await listCardsForDeck(userId, deckId);
    res.json({ cards: cards.map(serializeFlashcard) });
  } catch (error) {
    next(error);
  }
});

deckCardsRouter.post("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const deckId = getDeckIdParam(req);
    const body = cardBodySchema.parse(req.body);
    const card = await createCardForDeck(userId, deckId, body);
    res.status(201).json({ card: serializeFlashcard(card) });
  } catch (error) {
    next(error);
  }
});

deckCardsRouter.post("/bulk", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const deckId = getDeckIdParam(req);
    const body = bulkCardsSchema.parse(req.body);
    const cards = await createCardsBulkForDeck(userId, deckId, body.cards);
    res.status(201).json({ cards: cards.map(serializeFlashcard) });
  } catch (error) {
    next(error);
  }
});

deckCardsRouter.post("/generate", generateLimiter, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const deckId = getDeckIdParam(req);
    const deck = await getDeckForUser(userId, deckId);
    const body = generateSchema.parse(req.body);
    const cards = await generateFlashcards({
      ...body,
      deck: {
        title: deck.title,
        subject: deck.subject,
        description: deck.description,
      },
    });
    res.json({ cards });
  } catch (error) {
    next(error);
  }
});

deckCardsRouter.post(
  "/import/pdf",
  importLimiter,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const userId = getUserId(req);
      const deckId = getDeckIdParam(req);
      await getDeckForUser(userId, deckId);

      if (!req.file?.buffer) {
        throw new AppError(400, "PDF file is required");
      }

      const content = await extractTextFromPdf(req.file.buffer);
      res.json(buildImportResult(content));
    } catch (error) {
      next(error);
    }
  },
);

deckCardsRouter.post("/import/url", importLimiter, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const deckId = getDeckIdParam(req);
    await getDeckForUser(userId, deckId);

    const { url } = urlImportSchema.parse(req.body);
    const content = await extractTextFromUrl(url);
    res.json(buildImportResult(content));
  } catch (error) {
    next(error);
  }
});

export const cardsRouter = Router();

cardsRouter.use(authMiddleware);

cardsRouter.patch("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = cardBodySchema.partial().refine(
      (data) =>
        data.question !== undefined ||
        data.answer !== undefined ||
        data.imageUrl !== undefined,
      { message: "At least one field is required" },
    ).parse(req.body);
    const card = await updateCardForUser(userId, req.params.id, body);
    res.json({ card: serializeFlashcard(card) });
  } catch (error) {
    next(error);
  }
});

cardsRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    await deleteCardForUser(userId, req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
