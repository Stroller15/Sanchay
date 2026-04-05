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
    <div className="flex min-h-screen flex-col bg-white font-sans">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <span className="text-sm font-semibold tracking-tight text-gray-900">Sanchay</span>
        {status === "loading" ? null : session ? (
          <a
            href="/dashboard"
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Dashboard →
          </a>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Sign in
          </button>
        )}
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-16 text-center sm:px-10">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Personal resource manager
        </div>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Save any URL. <span className="text-green-500">Find it instantly.</span>
        </h1>

        <p className="mt-5 max-w-md text-base text-gray-500 sm:text-lg">
          GitHub repos, YouTube videos, articles, PDFs — one place for everything you want to
          remember.
        </p>

        <div className="mt-8">
          {status === "loading" ? (
            <div className="h-11 w-36 animate-pulse rounded-xl bg-gray-100" />
          ) : session ? (
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Open Dashboard →
            </a>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-green-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          )}
        </div>

        {/* Feature row */}
        <div className="mt-16 grid grid-cols-1 gap-px rounded-2xl border border-gray-100 bg-gray-100 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5 rounded-2xl bg-white px-6 py-5 sm:rounded-none sm:first:rounded-l-2xl sm:last:rounded-r-2xl">
            <div className="text-lg">📋</div>
            <p className="text-sm font-medium text-gray-900">Collections</p>
            <p className="text-xs leading-relaxed text-gray-400">
              Group your links into topics. Switch between them in one click.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 bg-white px-6 py-5">
            <div className="text-lg">⚡</div>
            <p className="text-sm font-medium text-gray-900">Instant search</p>
            <p className="text-xs leading-relaxed text-gray-400">
              Search by title, URL, tag, or notes. No more digging through tabs.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-white px-6 py-5 sm:rounded-none sm:first:rounded-l-2xl sm:last:rounded-r-2xl">
            <div className="text-lg">🏷️</div>
            <p className="text-sm font-medium text-gray-900">Smart tags</p>
            <p className="text-xs leading-relaxed text-gray-400">
              Auto-tagged by type — article, video, repo, PDF and more.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-4 text-center text-xs text-gray-400 sm:px-10">
        Sanchay — built for curious people who save too many links.
      </footer>
    </div>
  );
}
