import { Router } from "express";
import { prisma } from "@sanchay/db";
import { CreateCollectionSchema, UpdateCollectionSchema } from "@sanchay/validators";
import { requireApiKeyOrJwt } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { AppError } from "../middleware/error";

export const collectionsRouter = Router();

// POST /collections
collectionsRouter.post(
  "/",
  requireApiKeyOrJwt,
  validateBody(CreateCollectionSchema),
  async (req, res, next) => {
    try {
      const { sub } = req.auth!;
      const user = await prisma.user.findUnique({ where: { providerId: sub } });
      if (!user) throw new AppError(404, "User not found");

      const { name, emoji } = req.body;
      const position = await prisma.collection.count({ where: { userId: user.id } });

      const collection = await prisma.collection.create({
        data: { userId: user.id, name, emoji: emoji ?? "📁", position },
      });

      res.status(201).json({ data: collection });
    } catch (err) {
      next(err);
    }
  },
);

// GET /collections
collectionsRouter.get("/", requireApiKeyOrJwt, async (req, res, next) => {
  try {
    const { sub } = req.auth!;
    const user = await prisma.user.findUnique({ where: { providerId: sub } });
    if (!user) throw new AppError(404, "User not found");

    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: { position: "asc" },
      include: { _count: { select: { resources: true } } },
    });

    res.json({ data: collections });
  } catch (err) {
    next(err);
  }
});

// PATCH /collections/:id
collectionsRouter.patch(
  "/:id",
  requireApiKeyOrJwt,
  validateBody(UpdateCollectionSchema),
  async (req, res, next) => {
    try {
      const { sub } = req.auth!;
      const user = await prisma.user.findUnique({ where: { providerId: sub } });
      if (!user) throw new AppError(404, "User not found");

      const existing = await prisma.collection.findFirst({
        where: { id: req.params["id"]! as string, userId: user.id },
      });
      if (!existing) throw new AppError(404, "Collection not found");

      const { name, emoji, position } = req.body;

      // Simple integer swap for position updates
      if (position !== undefined && position !== existing.position) {
        const sibling = await prisma.collection.findFirst({
          where: { userId: user.id, position },
        });
        if (sibling) {
          await prisma.collection.update({
            where: { id: sibling.id },
            data: { position: existing.position },
          });
        }
      }

      const updated = await prisma.collection.update({
        where: { id: req.params["id"]! as string },
        data: { name, emoji, position },
      });

      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /collections/:id
collectionsRouter.delete("/:id", requireApiKeyOrJwt, async (req, res, next) => {
  try {
    const { sub } = req.auth!;
    const user = await prisma.user.findUnique({ where: { providerId: sub } });
    if (!user) throw new AppError(404, "User not found");

    const existing = await prisma.collection.findFirst({
      where: { id: req.params["id"]! as string, userId: user.id },
    });
    if (!existing) throw new AppError(404, "Collection not found");

    if (existing.name === "Unsorted") {
      throw new AppError(400, "Cannot delete the Unsorted collection");
    }

    // Reassign resources to Unsorted before deleting
    const unsorted = await prisma.collection.findFirst({
      where: { userId: user.id, name: "Unsorted" },
    });

    if (unsorted) {
      await prisma.resource.updateMany({
        where: { collectionId: req.params["id"]! as string },
        data: { collectionId: unsorted.id },
      });
    }

    await prisma.collection.delete({ where: { id: req.params["id"]! as string } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
