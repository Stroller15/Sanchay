import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "@sanchay/db";
import { SignJWT } from "jose";

const app = createApp();

async function makeJwt() {
  const secret = new TextEncoder().encode("test-secret-for-tests");
  return new SignJWT({ sub: "prov1", email: "test@example.com" })
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

const mockApiKey = {
  id: "key1",
  userId: "user1",
  key: "hashedvalue",
  label: "Chrome Extension",
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
});

describe("GET /api/v1/api-keys", () => {
  it("returns list without plaintext keys", async () => {
    // Mock returns only the selected fields (mimics Prisma select behavior)
    vi.mocked(prisma.apiKey.findMany).mockResolvedValue([
      { id: "key1", label: "Chrome Extension", createdAt: mockApiKey.createdAt } as never,
    ]);

    const token = await makeJwt();
    const res = await request(app).get("/api/v1/api-keys").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Should NOT include the raw key hash
    for (const k of res.body.data) {
      expect(k).not.toHaveProperty("key");
    }
    expect(res.body.data[0].label).toBe("Chrome Extension");
  });
});

describe("POST /api/v1/api-keys", () => {
  it("returns plaintext key once with sk_ prefix", async () => {
    vi.mocked(prisma.apiKey.create).mockResolvedValue(mockApiKey);

    const token = await makeJwt();
    const res = await request(app)
      .post("/api/v1/api-keys")
      .set("Authorization", `Bearer ${token}`)
      .send({ label: "My Extension" });

    expect(res.status).toBe(201);
    expect(res.body.data.key).toMatch(/^sk_/);
    // Verify what's stored is NOT the plaintext key
    const createCall = vi.mocked(prisma.apiKey.create).mock.calls[0]?.[0];
    expect(createCall?.data?.key).not.toMatch(/^sk_/); // stored as hash
    expect(createCall?.data?.key).toHaveLength(64); // SHA-256 hex
  });
});

describe("DELETE /api/v1/api-keys/:id", () => {
  it("removes the key and returns 204", async () => {
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue(mockApiKey);
    vi.mocked(prisma.apiKey.delete).mockResolvedValue(mockApiKey);

    const token = await makeJwt();
    const res = await request(app)
      .delete("/api/v1/api-keys/key1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(prisma.apiKey.delete).toHaveBeenCalledWith({ where: { id: "key1" } });
  });

  it("returns 404 when key not owned by user", async () => {
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue(null);
    const token = await makeJwt();
    const res = await request(app)
      .delete("/api/v1/api-keys/not-mine")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
