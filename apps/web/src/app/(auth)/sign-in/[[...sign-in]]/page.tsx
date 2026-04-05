"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password: "dev",
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-bg]">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[--color-text-primary]">Sanchay</h1>
          <p className="text-sm text-[--color-text-secondary]">
            Sign in to your account to continue
          </p>
        </div>

        <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {isDev && (
            <form onSubmit={handleDevLogin} className="mb-4 space-y-3 text-left">
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                Dev mode — enter any email to log in
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-primary] outline-none placeholder:text-[--color-text-tertiary] focus:border-[--color-accent]"
              />
              {error && <p className="text-xs text-[--color-danger]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[--color-accent] px-4 py-2 text-sm font-medium text-[--color-accent-fg] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in (dev)"}
              </button>
            </form>
          )}

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-[--color-border] bg-[--color-surface] px-4 py-2 text-sm font-medium text-[--color-text-primary] shadow-sm transition-colors hover:bg-[--color-bg]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.70496L1.275 6.60995C0.46 8.22995 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
