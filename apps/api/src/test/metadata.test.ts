import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { SignJWT } from "jose";

const app = createApp();

async function makeJwt() {
  const secret = new TextEncoder().encode("test-secret-for-tests");
  return new SignJWT({ sub: "prov1", email: "test@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);
}

// Mock global fetch
const mockFetch = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function makeHtmlResponse(html: string) {
  return {
    ok: true,
    text: async () => html,
  };
}

describe("GET /api/v1/metadata", () => {
  it("returns title + favicon from OG tags", async () => {
    mockFetch.mockResolvedValueOnce(
      makeHtmlResponse(`
        <meta property="og:title" content="React — The library for web and native user interfaces" />
        <link rel="icon" href="/favicon.ico" />
      `),
    );

    const token = await makeJwt();
    const res = await request(app)
      .get("/api/v1/metadata?url=https://react.dev")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("React — The library for web and native user interfaces");
    expect(res.body.data.favicon).toContain("https://react.dev");
  });

  it("falls back to hostname on fetch timeout", async () => {
    mockFetch.mockRejectedValueOnce(new Error("AbortError"));

    const token = await makeJwt();
    const res = await request(app)
      .get("/api/v1/metadata?url=https://slow-site.example.com")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("slow-site.example.com");
    expect(res.body.data.favicon).toBeNull();
  });

  it("returns 400 when url param is missing", async () => {
    const token = await makeJwt();
    const res = await request(app).get("/api/v1/metadata").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/url.*required/i);
  });

  it("returns 400 for invalid URL", async () => {
    const token = await makeJwt();
    const res = await request(app)
      .get("/api/v1/metadata?url=not-a-url")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("detects type correctly from URL", async () => {
    mockFetch.mockResolvedValueOnce(makeHtmlResponse("<title>My Repo</title>"));

    const token = await makeJwt();
    const res = await request(app)
      .get("/api/v1/metadata?url=https://github.com/user/repo")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.data.type).toBe("github");
  });
});
