import { Queue, Worker, type Job } from "bullmq";
import { prisma } from "@sanchay/db";
import { redis } from "./redis";

const connection = redis;

// --- Queue definitions ---
export const emailQueue = new Queue("email", { connection });
export const scrapeQueue = new Queue("scrape", { connection });

// --- Job data types ---
export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export interface ScrapeJobData {
  resourceId: string;
  url: string;
}

// --- Metadata scraping helper ---
async function scrapeMetadata(
  url: string,
): Promise<{ title: string; favicon: string | null; type: string }> {
  const hostname = new URL(url).hostname;
  const type = detectResourceType(url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Sanchay/1.0 (+https://sanchay.app)" },
    });
    clearTimeout(timeout);

    if (!res.ok) return { title: hostname, favicon: null, type };

    const html = await res.text();

    // Extract OG title → <title> → hostname fallback
    const ogTitle = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    )?.[1];
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
    const title = ogTitle || titleTag || hostname;

    // Favicon: try <link rel="icon"> or <link rel="shortcut icon">
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

    return { title, favicon, type };
  } catch {
    clearTimeout(timeout);
    return { title: hostname, favicon: null, type };
  }
}

export function detectResourceType(url: string): string {
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
}

// --- Workers ---
export function startWorkers() {
  const emailWorker = new Worker<EmailJobData>(
    "email",
    async (job: Job<EmailJobData>) => {
      console.info(`Processing email job ${job.id} to ${job.data.to}`);
      // TODO: integrate email provider (e.g., Resend, SendGrid)
    },
    { connection },
  );

  const scrapeWorker = new Worker<ScrapeJobData>(
    "scrape",
    async (job: Job<ScrapeJobData>) => {
      const { resourceId, url } = job.data;
      const { title, favicon, type } = await scrapeMetadata(url);
      await prisma.resource.update({
        where: { id: resourceId },
        data: { title, favicon, type },
      });
    },
    { connection },
  );

  emailWorker.on("failed", (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err);
  });

  scrapeWorker.on("failed", (job, err) => {
    console.error(`Scrape job ${job?.id} failed:`, err);
  });

  return { emailWorker, scrapeWorker };
}
