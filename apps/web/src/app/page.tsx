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
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-24 dark:bg-neutral-950">
      <div className="max-w-lg text-center">
        <h1 className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Sanchay
        </h1>
        <p className="mt-4 text-lg text-neutral-500">
          Save any URL. Organize by collection. Find anything instantly.
        </p>
        <p className="mt-2 text-sm text-neutral-400">
          GitHub repos, YouTube videos, PDFs, articles — one place for everything.
        </p>

        <div className="mt-10">
          {status === "loading" ? (
            <div className="mx-auto h-10 w-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          ) : session ? (
            <a
              href="/dashboard"
              className="inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Open Dashboard →
            </a>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
