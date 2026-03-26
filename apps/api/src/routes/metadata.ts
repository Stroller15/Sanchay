import { Router } from "express";
import { requireApiKeyOrJwt } from "../middleware/auth";
import { AppError } from "../middleware/error";
import { detectResourceType } from "../lib/queue";

export const metadataRouter = Router();

// GET /metadata?url=
metadataRouter.get("/", requireApiKeyOrJwt, async (req, res, next) => {
  try {
    const { url } = req.query as { url?: string };

    if (!url) throw new AppError(400, "url parameter is required");

    let hostname: string;
    try {
      hostname = new URL(url).hostname;
    } catch {
      throw new AppError(400, "Invalid URL");
    }

    const type = detectResourceType(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Sanchay/1.0 (+https://sanchay.app)" },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return res.json({ data: { title: hostname, favicon: null, type } });
      }

      const html = await response.text();

      const ogTitle = html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      )?.[1];
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
      const title = ogTitle || titleTag || hostname;

      const faviconPath =
        html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)?.[1] ??
        null;

      let favicon: string | null = null;
      if (faviconPath) {
        try {
          favicon = new URL(faviconPath, url).href;
        } catch {
          favicon = null;
        }
      }

      return res.json({ data: { title, favicon, type } });
    } catch {
      clearTimeout(timeout);
      return res.json({ data: { title: hostname, favicon: null, type } });
    }
  } catch (err) {
    next(err);
  }
});
