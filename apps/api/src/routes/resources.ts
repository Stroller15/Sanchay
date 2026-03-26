import { Router } from "express";
import { prisma } from "@sanchay/db";
import {
  CreateResourceSchema,
  UpdateResourceSchema,
  ListResourcesSchema,
} from "@sanchay/validators";
import { requireApiKeyOrJwt } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { AppError } from "../middleware/error";
import { scrapeQueue, detectResourceType } from "../lib/queue";
import type { PaginatedResponse } from "@sanchay/types";

export const resourcesRouter = Router();

// Defensively find or create the "Unsorted" collection for a user
async function findOrCreateUnsorted(userId: string): Promise<string> {
  let unsorted = await prisma.collection.findFirst({
    where: { userId, name: "Unsorted" },
  });
  if (!unsorted) {
    const count = await prisma.collection.count({ where: { userId } });
    unsorted = await prisma.collection.create({
      data: { userId, name: "Unsorted", emoji: "📂", position: count },
    });
  }
  return unsorted.id;
}

// POST /resources
resourcesRouter.post(
  "/",
  requireApiKeyOrJwt,
  validateBody(CreateResourceSchema),
  async (req, res, next) => {
    try {
      const { sub } = req.auth!;
      const user = await prisma.user.findUnique({ where: { providerId: sub } });
      if (!user) throw new AppError(404, "User not found");

      const { url, collectionId, notes, tags } = req.body;

      // Validate URL
      let hostname: string;
      try {
        hostname = new URL(url).hostname;
      } catch {
        throw new AppError(400, "Invalid URL");
      }

      const resolvedCollectionId = collectionId ?? (await findOrCreateUnsorted(user.id));

      // Verify collection belongs to this user
      const collection = await prisma.collection.findFirst({
        where: { id: resolvedCollectionId, userId: user.id },
      });
      if (!collection) throw new AppError(404, "Collection not found");

      const type = detectResourceType(url);

      const resource = await prisma.resource.create({
        data: {
          userId: user.id,
          collectionId: resolvedCollectionId,
          url,
          title: hostname, // Placeholder until scraper runs
          type,
          notes: notes ?? null,
          tags: tags ?? [],
        },
      });

      // Best-effort async scrape
      try {
        await scrapeQueue.add("scrape", { resourceId: resource.id, url });
      } catch {
        // BullMQ unavailable — proceed, title stays as hostname
      }

      res.status(201).json({ data: resource });
    } catch (err) {
      next(err);
    }
  },
);

// GET /resources
resourcesRouter.get(
  "/",
  requireApiKeyOrJwt,
  validateQuery(ListResourcesSchema),
  async (req, res, next) => {
    try {
      const { sub } = req.auth!;
      const user = await prisma.user.findUnique({ where: { providerId: sub } });
      if (!user) throw new AppError(404, "User not found");

      const { q, collection, type, tag, page, pageSize } = req.query as {
        q?: string;
        collection?: string;
        type?: string;
        tag?: string;
        page: string;
        pageSize: string;
      };

      const pageNum = Number(page) || 1;
      const pageSizeNum = Number(pageSize) || 20;
      const skip = (pageNum - 1) * pageSizeNum;

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = { userId: user.id };
      if (collection) where.collectionId = collection;
      if (type) where.type = type;
      if (tag) where.tags = { has: tag };

      let resources;
      let total: number;

      if (q) {
        // Full-text search via raw SQL with COALESCE for nullable notes
        // Also apply collection filter if present
        type FtsRow = { id: string };
        type CountRow = { count: bigint };

        if (collection) {
          const searchResults = await prisma.$queryRaw<FtsRow[]>`
            SELECT id FROM resources
            WHERE "userId" = ${user.id}
            AND "collectionId" = ${collection}
            AND to_tsvector('english', title || ' ' || url || ' ' || COALESCE(notes, ''))
                @@ plainto_tsquery('english', ${q})
            ORDER BY "savedAt" DESC
            LIMIT ${pageSizeNum} OFFSET ${skip}
          `;
          resources = await prisma.resource.findMany({
            where: { id: { in: searchResults.map((r) => r.id) } },
            orderBy: { savedAt: "desc" },
          });
          const countResult = await prisma.$queryRaw<CountRow[]>`
            SELECT COUNT(*) as count FROM resources
            WHERE "userId" = ${user.id}
            AND "collectionId" = ${collection}
            AND to_tsvector('english', title || ' ' || url || ' ' || COALESCE(notes, ''))
                @@ plainto_tsquery('english', ${q})
          `;
          total = Number(countResult[0]?.count ?? 0);
        } else {
          const searchResults = await prisma.$queryRaw<FtsRow[]>`
            SELECT id FROM resources
            WHERE "userId" = ${user.id}
            AND to_tsvector('english', title || ' ' || url || ' ' || COALESCE(notes, ''))
                @@ plainto_tsquery('english', ${q})
            ORDER BY "savedAt" DESC
            LIMIT ${pageSizeNum} OFFSET ${skip}
          `;
          resources = await prisma.resource.findMany({
            where: { id: { in: searchResults.map((r) => r.id) } },
            orderBy: { savedAt: "desc" },
          });
          const countResult = await prisma.$queryRaw<CountRow[]>`
            SELECT COUNT(*) as count FROM resources
            WHERE "userId" = ${user.id}
            AND to_tsvector('english', title || ' ' || url || ' ' || COALESCE(notes, ''))
                @@ plainto_tsquery('english', ${q})
          `;
          total = Number(countResult[0]?.count ?? 0);
        }
      } else {
        [resources, total] = await Promise.all([
          prisma.resource.findMany({
            where,
            orderBy: { savedAt: "desc" },
            skip,
            take: pageSizeNum,
          }),
          prisma.resource.count({ where }),
        ]);
      }

      const response: PaginatedResponse<(typeof resources)[0]> = {
        data: resources,
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  },
);

// GET /resources/:id
resourcesRouter.get("/:id", requireApiKeyOrJwt, async (req, res, next) => {
  try {
    const { sub } = req.auth!;
    const user = await prisma.user.findUnique({ where: { providerId: sub } });
    if (!user) throw new AppError(404, "User not found");

    const resource = await prisma.resource.findFirst({
      where: { id: req.params["id"]! as string, userId: user.id },
    });
    if (!resource) throw new AppError(404, "Resource not found");

    res.json({ data: resource });
  } catch (err) {
    next(err);
  }
});

// PATCH /resources/:id
resourcesRouter.patch(
  "/:id",
  requireApiKeyOrJwt,
  validateBody(UpdateResourceSchema),
  async (req, res, next) => {
    try {
      const { sub } = req.auth!;
      const user = await prisma.user.findUnique({ where: { providerId: sub } });
      if (!user) throw new AppError(404, "User not found");

      const existing = await prisma.resource.findFirst({
        where: { id: req.params["id"]! as string, userId: user.id },
      });
      if (!existing) throw new AppError(404, "Resource not found");

      if (req.body.collectionId) {
        const col = await prisma.collection.findFirst({
          where: { id: req.body.collectionId, userId: user.id },
        });
        if (!col) throw new AppError(404, "Collection not found");
      }

      const updated = await prisma.resource.update({
        where: { id: req.params["id"]! as string },
        data: req.body,
      });

      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /resources/:id
resourcesRouter.delete("/:id", requireApiKeyOrJwt, async (req, res, next) => {
  try {
    const { sub } = req.auth!;
    const user = await prisma.user.findUnique({ where: { providerId: sub } });
    if (!user) throw new AppError(404, "User not found");

    const existing = await prisma.resource.findFirst({
      where: { id: req.params["id"]! as string, userId: user.id },
    });
    if (!existing) throw new AppError(404, "Resource not found");

    await prisma.resource.delete({ where: { id: req.params["id"]! as string } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
