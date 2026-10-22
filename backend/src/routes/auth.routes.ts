import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware, getUserId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import {
  deleteAccountForUser,
  syncUserProfileFromClerk,
} from "../services/user.service";

export const authRouter = Router();

const deleteAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many account deletion attempts. Try again later." },
});

authRouter.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    // Sync name/avatar from Clerk so profile photo updates appear in-app.
    const user = await syncUserProfileFromClerk(userId);
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

/**
 * Permanently deletes the caller's Neon study data (cascade) and Clerk user.
 * Client should clear local storage and sign out after success.
 */
authRouter.delete(
  "/account",
  deleteAccountLimiter,
  authMiddleware,
  async (req, res, next) => {
    try {
      const userId = getUserId(req);
      await deleteAccountForUser(userId);
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  },
);

authRouter.post("/register", (_req, res) => {
  res.status(410).json({
    error: "Email/password registration is handled by Clerk. Use the mobile app.",
  });
});

authRouter.post("/login", (_req, res) => {
  res.status(410).json({
    error: "Email/password login is handled by Clerk. Use the mobile app.",
  });
});

authRouter.post("/refresh", (_req, res) => {
  res.status(410).json({
    error: "Token refresh is handled by Clerk sessions.",
  });
});

authRouter.post("/logout", (_req, res) => {
  res.status(410).json({
    error: "Logout is handled by Clerk on the client.",
  });
});
