import { describe, it, expect, vi, beforeEach } from "vitest";
import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "@sanchay/db";
import { SignJWT } from "jose";

// We need to import after env is set up (setup.ts runs first)
let requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
let requireApiKeyOrJwt: (req: Request, res: Response, next: NextFunction) => Promise<void>;

beforeEach(async () => {
  const mod = await import("../middleware/auth");
  requireAuth = mod.requireAuth;
  requireApiKeyOrJwt = mod.requireApiKeyOrJwt;
  vi.clearAllMocks();
});

function mockReqRes(authHeader?: string) {
  const req = { headers: { authorization: authHeader } } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
}

async function makeJwt(sub = "user123", email = "test@example.com") {
  const secret = new TextEncoder().encode("test-secret-for-tests");
  return new SignJWT({ sub, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
}

describe("requireAuth", () => {
  it("returns 401 when no Authorization header", async () => {
    const { req, res, next } = mockReqRes();
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Bearer token is missing", async () => {
    const { req, res, next } = mockReqRes("Basic abc");
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("sets req.auth and calls next for valid JWT", async () => {
    const token = await makeJwt("u1", "user@example.com");
    const { req, res, next } = mockReqRes(`Bearer ${token}`);
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as Request & { auth: { sub: string; email: string } }).auth).toMatchObject({
      sub: "u1",
      email: "user@example.com",
    });
  });

  it("returns 401 for expired JWT", async () => {
    const secret = new TextEncoder().encode("test-secret-for-tests");
    const expired = await new SignJWT({ sub: "u1", email: "x@x.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("-1h")
      .sign(secret);
    const { req, res, next } = mockReqRes(`Bearer ${expired}`);
    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("requireApiKeyOrJwt", () => {
  it("returns 401 when no Authorization header", async () => {
    const { req, res, next } = mockReqRes();
    await requireApiKeyOrJwt(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("JWT path: valid token sets req.auth", async () => {
    const token = await makeJwt("u2", "api@example.com");
    const { req, res, next } = mockReqRes(`Bearer ${token}`);
    await requireApiKeyOrJwt(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as Request & { auth: { sub: string } }).auth.sub).toBe("u2");
  });

  it("API key path: sk_ prefix — valid hash → req.auth set", async () => {
    const { createHash } = await import("crypto");
    const plaintext = "sk_abc123";
    const hash = createHash("sha256").update(plaintext).digest("hex");

    vi.mocked(prisma.apiKey.findFirst).mockResolvedValueOnce({
      id: "key1",
      key: hash,
      label: "test",
      userId: "u3",
      createdAt: new Date(),
      user: {
        id: "u3",
        providerId: "prov3",
        email: "ext@example.com",
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as unknown as ReturnType<typeof prisma.apiKey.findFirst> extends Promise<infer T>
      ? T
      : never);

    const { req, res, next } = mockReqRes(`Bearer ${plaintext}`);
    await requireApiKeyOrJwt(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as Request & { auth: { email: string } }).auth.email).toBe("ext@example.com");
  });

  it("API key path: sk_ prefix — not found → 401", async () => {
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValueOnce(null);
    const { req, res, next } = mockReqRes("Bearer sk_invalid");
    await requireApiKeyOrJwt(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("API key path: sk_ prefix — DB throws → 503", async () => {
    vi.mocked(prisma.apiKey.findFirst).mockRejectedValueOnce(new Error("DB down"));
    const { req, res, next } = mockReqRes("Bearer sk_something");
    await requireApiKeyOrJwt(req, res, next);
    expect(res.status).toHaveBeenCalledWith(503);
  });

  it("does NOT query DB for non-sk_ tokens (JWT path)", async () => {
    const token = await makeJwt();
    const { req, res, next } = mockReqRes(`Bearer ${token}`);
    await requireApiKeyOrJwt(req, res, next);
    expect(prisma.apiKey.findFirst).not.toHaveBeenCalled();
  });
});
