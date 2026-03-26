import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "@sanchay/db";
import { env } from "../lib/env";

const secret = new TextEncoder().encode(env.NEXTAUTH_SECRET);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        email: string;
      };
    }
  }
}

// Original JWT-only middleware (kept for backward compat)
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, secret);
    req.auth = {
      sub: payload.sub as string,
      email: payload.email as string,
    };
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}

// Dual-auth middleware: sk_ prefix → API key lookup; otherwise → JWT
export async function requireApiKeyOrJwt(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);

  if (token.startsWith("sk_")) {
    // API key path: hash and look up in DB
    try {
      const hash = createHash("sha256").update(token).digest("hex");
      const hashBuf = Buffer.from(hash, "hex");

      const apiKey = await prisma.apiKey.findFirst({
        where: { key: hash },
        include: { user: true },
      });

      if (!apiKey) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      // Use timingSafeEqual to compare hashes (prevent timing attacks)
      const storedBuf = Buffer.from(apiKey.key, "hex");
      if (hashBuf.length !== storedBuf.length || !timingSafeEqual(hashBuf, storedBuf)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      req.auth = { sub: apiKey.user.providerId, email: apiKey.user.email };
      next();
    } catch {
      res.status(503).json({ message: "Service temporarily unavailable" });
    }
    return;
  }

  // JWT path
  try {
    const { payload } = await jwtVerify(token, secret);
    req.auth = {
      sub: payload.sub as string,
      email: payload.email as string,
    };
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
