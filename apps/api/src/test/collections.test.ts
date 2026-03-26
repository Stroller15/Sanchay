import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "@sanchay/db";
import { SignJWT } from "jose";

const app = createApp();

async function makeJwt(sub = "prov1") {
  const secret = new TextEncoder().encode("test-secret-for-tests");
  return new SignJWT({ sub, email: "test@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
}

const mockUser = {
  id: "user1",
  providerId: "prov1",
  email: "test@example.com",
  name: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCollection = {
  id: "col1",
  userId: "user1",
  name: "Frontend",
  emoji: "🎨",
  position: 1,
  createdAt: new Date(),
};

const unsortedCollection = {
  id: "col0",
  userId: "user1",
  name: "Unsorted",
  emoji: "📂",
  position: 0,
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
});

describe("POST /api/v1/collections", () => {
  it("creates collection with position = existing count", async () => {
    vi.mocked(prisma.collection.count).mockResolvedValue(2);
    vi.mocked(prisma.collection.create).mockResolvedValue({ ...mockCollection, position: 2 });

    const token = await makeJwt();
    const res = await request(app)
      .post("/api/v1/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Frontend", emoji: "🎨" });

    expect(res.status).toBe(201);
    expect(prisma.collection.count).toHaveBeenCalledWith({ where: { userId: "user1" } });
    expect(prisma.collection.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ position: 2 }) }),
    );
  });

  it("returns 400 for empty name", async () => {
    const token = await makeJwt();
    const res = await request(app)
      .post("/api/v1/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/collections", () => {
  it("returns collections with _count.resources", async () => {
    const collectionsWithCount = [
      { ...unsortedCollection, _count: { resources: 3 } },
      { ...mockCollection, _count: { resources: 1 } },
    ];
    vi.mocked(prisma.collection.findMany).mockResolvedValue(collectionsWithCount as never);

    const token = await makeJwt();
    const res = await request(app)
      .get("/api/v1/collections")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data[0]._count.resources).toBe(3);
  });
});

describe("PATCH /api/v1/collections/:id", () => {
  it("updates name and emoji", async () => {
    vi.mocked(prisma.collection.findFirst).mockResolvedValue(mockCollection);
    const updated = { ...mockCollection, name: "React", emoji: "⚛️" };
    vi.mocked(prisma.collection.update).mockResolvedValue(updated);

    const token = await makeJwt();
    const res = await request(app)
      .patch("/api/v1/collections/col1")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "React", emoji: "⚛️" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("React");
  });
});

describe("DELETE /api/v1/collections/:id", () => {
  it("returns 400 when deleting Unsorted", async () => {
    vi.mocked(prisma.collection.findFirst).mockResolvedValue(unsortedCollection);

    const token = await makeJwt();
    const res = await request(app)
      .delete("/api/v1/collections/col0")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot delete.*unsorted/i);
  });

  it("reassigns resources to Unsorted then deletes", async () => {
    vi.mocked(prisma.collection.findFirst)
      .mockResolvedValueOnce(mockCollection) // find the collection to delete
      .mockResolvedValueOnce(unsortedCollection); // find Unsorted for reassignment
    vi.mocked(prisma.resource.updateMany).mockResolvedValue({ count: 2 });
    vi.mocked(prisma.collection.delete).mockResolvedValue(mockCollection);

    const token = await makeJwt();
    const res = await request(app)
      .delete("/api/v1/collections/col1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(prisma.resource.updateMany).toHaveBeenCalledWith({
      where: { collectionId: "col1" },
      data: { collectionId: unsortedCollection.id },
    });
    expect(prisma.collection.delete).toHaveBeenCalled();
  });

  it("returns 404 for non-existent collection", async () => {
    vi.mocked(prisma.collection.findFirst).mockResolvedValue(null);
    const token = await makeJwt();
    const res = await request(app)
      .delete("/api/v1/collections/missing")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
