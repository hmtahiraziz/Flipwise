import { Router } from "express";
import { z } from "zod";
import { authMiddleware, getUserId } from "../middleware/auth";
import {
  createDeckForUser,
  deleteDeckForUser,
  getDeckForUser,
  listDecksForUser,
  serializeDeck,
  updateDeckForUser,
} from "../services/deck.service";

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const createDeckSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  subject: z.string().trim().min(1, "Subject is required").max(80),
  description: z.string().trim().max(500).optional(),
  examDate: dateStringSchema.optional().nullable(),
  isFavorite: z.boolean().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional().nullable(),
});

const updateDeckSchema = createDeckSchema
  .extend({
    isArchived: z.boolean().optional(),
  })
  .partial();

export const decksRouter = Router();

decksRouter.use(authMiddleware);

decksRouter.get("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const decks = await listDecksForUser(userId);
    res.json({ decks: decks.map(serializeDeck) });
  } catch (error) {
    next(error);
  }
});

decksRouter.get("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const deck = await getDeckForUser(userId, req.params.id);
    res.json({ deck: serializeDeck(deck) });
  } catch (error) {
    next(error);
  }
});

decksRouter.post("/", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = createDeckSchema.parse(req.body);
    const deck = await createDeckForUser(userId, body);
    res.status(201).json({ deck: serializeDeck(deck) });
  } catch (error) {
    next(error);
  }
});

decksRouter.patch("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = updateDeckSchema.parse(req.body);
    const deck = await updateDeckForUser(userId, req.params.id, body);
    res.json({ deck: serializeDeck(deck) });
  } catch (error) {
    next(error);
  }
});

decksRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = getUserId(req);
    await deleteDeckForUser(userId, req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
