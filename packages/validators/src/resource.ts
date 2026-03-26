import { z } from "zod";

export const CreateResourceSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  collectionId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateResourceSchema = z.object({
  collectionId: z.string().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  type: z.enum(["github", "video", "pdf", "article", "other"]).optional(),
  title: z.string().optional(),
});

export const ListResourcesSchema = z.object({
  q: z.string().optional(),
  collection: z.string().optional(),
  type: z.enum(["github", "video", "pdf", "article", "other"]).optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const CreateCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  emoji: z.string().optional(),
});

export const UpdateCollectionSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  emoji: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export const CreateApiKeySchema = z.object({
  label: z.string().min(1).max(50).default("API Key"),
});

export type CreateResourceInput = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>;
export type ListResourcesInput = z.infer<typeof ListResourcesSchema>;
export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;
export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;
