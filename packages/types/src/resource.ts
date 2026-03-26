export type ResourceType = "github" | "video" | "pdf" | "article" | "other";

export interface Resource {
  id: string;
  userId: string;
  collectionId: string;
  url: string;
  title: string;
  favicon: string | null;
  type: ResourceType;
  notes: string | null;
  tags: string[];
  savedAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  position: number;
  createdAt: string;
  _count?: { resources: number };
}

export interface ApiKey {
  id: string;
  userId: string;
  label: string;
  createdAt: string;
}
