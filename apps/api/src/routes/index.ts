import { Router } from "express";
import { usersRouter } from "./users";
import { resourcesRouter } from "./resources";
import { collectionsRouter } from "./collections";
import { metadataRouter } from "./metadata";
import { apiKeysRouter } from "./api-keys";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/users", usersRouter);
router.use("/resources", resourcesRouter);
router.use("/collections", collectionsRouter);
router.use("/metadata", metadataRouter);
router.use("/api-keys", apiKeysRouter);
