import { Router } from "express";
import { authMiddleware, getUserId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { getUserById } from "../services/user.service";

export const authRouter = Router();

authRouter.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const user = await getUserById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

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
