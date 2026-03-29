"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[--color-bg] p-24">
      <div className="max-w-lg text-center">
        <h1 className="text-5xl font-bold tracking-tight text-[--color-text-primary]">Sanchay</h1>
        <p className="mt-4 text-lg text-[--color-text-secondary]">
          Save any URL. Organize by collection. Find anything instantly.
        </p>
        <p className="mt-2 text-sm text-[--color-text-tertiary]">
          GitHub repos, YouTube videos, PDFs, articles — one place for everything.
        </p>

        <div className="mt-10">
          {status === "loading" ? (
            <div className="mx-auto h-10 w-32 animate-pulse rounded-[10px] bg-[--color-surface]" />
          ) : session ? (
            <a
              href="/dashboard"
              className="inline-flex items-center rounded-[10px] bg-[--color-accent] px-6 py-3 text-sm font-semibold text-[--color-accent-fg] transition-opacity hover:opacity-90"
            >
              Open Dashboard →
            </a>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[--color-accent] px-6 py-3 text-sm font-semibold text-[--color-accent-fg] transition-opacity hover:opacity-90"
            >
              Get Started →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
