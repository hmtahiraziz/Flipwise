import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";
import { getEnv } from "../config/env";
import { AppError } from "./errorHandler";
import { findOrCreateUserFromClerk } from "../services/user.service";

export type AuthRequest = Request & { userId: string };

export function getUserId(req: Request): string {
  return (req as AuthRequest).userId;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: getEnv().CLERK_SECRET_KEY,
    });

    const clerkUserId = payload.sub;
    if (!clerkUserId) {
      res.status(401).json({ error: "Invalid token subject" });
      return;
    }

    const user = await findOrCreateUserFromClerk(clerkUserId);
    (req as AuthRequest).userId = user.id;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
