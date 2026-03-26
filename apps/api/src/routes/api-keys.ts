import { Router } from "express";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@sanchay/db";
import { CreateApiKeySchema } from "@sanchay/validators";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { AppError } from "../middleware/error";

export const apiKeysRouter = Router();

// GET /api-keys
apiKeysRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const { sub } = req.auth!;
    const user = await prisma.user.findUnique({ where: { providerId: sub } });
    if (!user) throw new AppError(404, "User not found");

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, label: true, createdAt: true },
    });

    res.json({ data: keys });
  } catch (err) {
    next(err);
  }
});

// POST /api-keys
apiKeysRouter.post("/", requireAuth, validateBody(CreateApiKeySchema), async (req, res, next) => {
  try {
    const { sub } = req.auth!;
    const user = await prisma.user.findUnique({ where: { providerId: sub } });
    if (!user) throw new AppError(404, "User not found");

    const { label } = req.body;

    // Generate key: sk_ prefix + 32 random bytes in hex
    const plaintext = `sk_${randomBytes(32).toString("hex")}`;
    const hash = createHash("sha256").update(plaintext).digest("hex");

    await prisma.apiKey.create({
      data: { userId: user.id, key: hash, label: label ?? "API Key" },
    });

    // Return plaintext once — never stored
    res.status(201).json({ data: { key: plaintext, label } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api-keys/:id
apiKeysRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { sub } = req.auth!;
    const user = await prisma.user.findUnique({ where: { providerId: sub } });
    if (!user) throw new AppError(404, "User not found");

    const existing = await prisma.apiKey.findFirst({
      where: { id: req.params["id"]! as string, userId: user.id },
    });
    if (!existing) throw new AppError(404, "API key not found");

    await prisma.apiKey.delete({ where: { id: req.params["id"]! as string } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
