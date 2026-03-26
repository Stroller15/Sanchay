import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "@sanchay/db";
import { SignJWT } from "jose";

// Mock queue to avoid BullMQ connection
vi.mock("../lib/queue", () => ({
  scrapeQueue: { add: vi.fn().mockResolvedValue(undefined) },
  detectResourceType: (url: string) => {
    if (url.includes("github.com")) return "github";
    if (url.includes("youtube.com")) return "video";
    return "article";
  },
}));

const app = createApp();

async function makeJwt(sub = "prov1", email = "test@example.com") {
  const secret = new TextEncoder().encode("test-secret-for-tests");
  return new SignJWT({ sub, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
}

const mockUser = {
  id: "user1",
  providerId: "prov1",
  email: "test@example.com",
  name: "Test User",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCollection = {
  id: "col1",
  userId: "user1",
  name: "Unsorted",
  emoji: "📂",
  position: 0,
  createdAt: new Date(),
};

const mockResource = {
  id: "res1",
  userId: "user1",
  collectionId: "col1",
  url: "https://github.com/facebook/react",
  title: "github.com",
  favicon: null,
  type: "github",
  notes: null,
  tags: [],
  savedAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
  vi.mocked(prisma.collection.findFirst).mockResolvedValue(mockCollection);
  vi.mocked(prisma.collection.count).mockResolvedValue(1);
});

describe("POST /api/v1/resources", () => {
  it("returns 201 with valid URL and enqueues scrape job", async () => {
    const { scrapeQueue } = await import("../lib/queue");
    vi.mocked(prisma.resource.create).mockResolvedValue(mockResource);

    const token = await makeJwt();
    const res = await request(app)
      .post("/api/v1/resources")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://github.com/facebook/react" });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toBe("https://github.com/facebook/react");
    expect(scrapeQueue.add).toHaveBeenCalledWith("scrape", {
      resourceId: mockResource.id,
      url: mockResource.url,
    });
  });

  it("returns 400 for invalid URL", async () => {
    const token = await makeJwt();
    const res = await request(app)
      .post("/api/v1/resources")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "not-a-url" });
    expect(res.status).toBe(400);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).post("/api/v1/resources").send({ url: "https://example.com" });
    expect(res.status).toBe(401);
  });

  it("creates Unsorted collection if missing and proceeds", async () => {
    vi.mocked(prisma.collection.findFirst)
      .mockResolvedValueOnce(null) // findOrCreateUnsorted — not found
      .mockResolvedValueOnce(mockCollection); // ownership check
    vi.mocked(prisma.collection.create).mockResolvedValue(mockCollection);
    vi.mocked(prisma.resource.create).mockResolvedValue(mockResource);

    const token = await makeJwt();
    const res = await request(app)
      .post("/api/v1/resources")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com" });

    expect(res.status).toBe(201);
    expect(prisma.collection.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: "Unsorted" }) }),
    );
  });

  it("proceeds even when scrapeQueue.add throws (best-effort)", async () => {
    const { scrapeQueue } = await import("../lib/queue");
    vi.mocked(scrapeQueue.add).mockRejectedValueOnce(new Error("Redis down"));
    vi.mocked(prisma.resource.create).mockResolvedValue(mockResource);

    const token = await makeJwt();
    const res = await request(app)
      .post("/api/v1/resources")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com" });

    expect(res.status).toBe(201); // save still succeeds
  });
});

describe("GET /api/v1/resources", () => {
  beforeEach(() => {
    vi.mocked(prisma.resource.findMany).mockResolvedValue([mockResource]);
    vi.mocked(prisma.resource.count).mockResolvedValue(1);
  });

  it("returns paginated list for authenticated user", async () => {
    const token = await makeJwt();
    const res = await request(app).get("/api/v1/resources").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
  });

  it("respects page and pageSize params", async () => {
    const token = await makeJwt();
    const res = await request(app)
      .get("/api/v1/resources?page=2&pageSize=10")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.pageSize).toBe(10);
  });
});

describe("GET /api/v1/resources/:id", () => {
  it("returns 200 for owned resource", async () => {
    vi.mocked(prisma.resource.findFirst).mockResolvedValue(mockResource);
    const token = await makeJwt();
    const res = await request(app)
      .get("/api/v1/resources/res1")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("res1");
  });

  it("returns 404 for resource not found or different user", async () => {
    vi.mocked(prisma.resource.findFirst).mockResolvedValue(null);
    const token = await makeJwt();
    const res = await request(app)
      .get("/api/v1/resources/not-mine")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/v1/resources/:id", () => {
  it("returns 200 with updated fields", async () => {
    const updated = { ...mockResource, tags: ["react", "frontend"] };
    vi.mocked(prisma.resource.findFirst).mockResolvedValue(mockResource);
    vi.mocked(prisma.resource.update).mockResolvedValue(updated);

    const token = await makeJwt();
    const res = await request(app)
      .patch("/api/v1/resources/res1")
      .set("Authorization", `Bearer ${token}`)
      .send({ tags: ["react", "frontend"] });

    expect(res.status).toBe(200);
    expect(res.body.data.tags).toEqual(["react", "frontend"]);
  });

  it("returns 404 when resource not owned", async () => {
    vi.mocked(prisma.resource.findFirst).mockResolvedValue(null);
    const token = await makeJwt();
    const res = await request(app)
      .patch("/api/v1/resources/not-mine")
      .set("Authorization", `Bearer ${token}`)
      .send({ notes: "hi" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/resources/:id", () => {
  it("returns 204 on successful delete", async () => {
    vi.mocked(prisma.resource.findFirst).mockResolvedValue(mockResource);
    vi.mocked(prisma.resource.delete).mockResolvedValue(mockResource);

    const token = await makeJwt();
    const res = await request(app)
      .delete("/api/v1/resources/res1")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it("returns 404 when resource not found", async () => {
    vi.mocked(prisma.resource.findFirst).mockResolvedValue(null);
    const token = await makeJwt();
    const res = await request(app)
      .delete("/api/v1/resources/missing")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
