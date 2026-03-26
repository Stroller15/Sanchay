"use client";

import posthog from "posthog-js";
import { env } from "./env";

export function initPostHog() {
  if (typeof window !== "undefined" && env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // We'll capture manually with Next.js router
    });
  }
}

export { posthog };
