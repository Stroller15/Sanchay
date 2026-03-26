import { vi } from "vitest";

// Mock environment variables for tests
process.env["NODE_ENV"] = "test";
process.env["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test";
process.env["DIRECT_URL"] = "postgresql://test:test@localhost:5432/test";
process.env["NEXTAUTH_SECRET"] = "test-secret-for-tests";
process.env["REDIS_URL"] = "redis://localhost:6379";
process.env["CORS_ORIGIN"] = "http://localhost:3000";

// Mock Redis to prevent BullMQ connection in tests
vi.mock("../lib/redis", () => ({
  redis: {},
}));

vi.mock("../lib/queue", () => ({
  scrapeQueue: { add: vi.fn().mockResolvedValue(undefined) },
  emailQueue: { add: vi.fn().mockResolvedValue(undefined) },
  detectResourceType: (url: string) => {
    try {
      const { hostname, pathname } = new URL(url);
      if (hostname === "github.com") return "github";
      if (hostname === "youtube.com" || hostname === "www.youtube.com" || hostname === "youtu.be")
        return "video";
      if (pathname.endsWith(".pdf") || pathname.includes("/pdf/")) return "pdf";
      return "article";
    } catch {
      return "article";
    }
  },
  startWorkers: vi.fn(),
}));

// Mock Prisma
vi.mock("@sanchay/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    collection: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
    resource: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      updateMany: vi.fn(),
    },
    apiKey: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $disconnect: vi.fn(),
  },
}));
