"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "@/hooks/use-api-keys";
import type { ApiKey } from "@sanchay/types";

export default function SettingsPage() {
  const { status } = useSession();
  const { data: apiKeys, isLoading } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (status === "unauthenticated") {
    redirect("/");
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const result = await createApiKey.mutateAsync(newKeyLabel || "API Key");
    setGeneratedKey(result.key);
    setNewKeyLabel("");
  }

  async function handleCopy() {
    if (!generatedKey) return;
    await navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete(key: ApiKey) {
    if (!confirm(`Revoke API key "${key.label}"?`)) return;
    await deleteApiKey.mutateAsync(key.id);
  }

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <header className="border-b border-[--color-border] bg-[--color-surface] px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <a
            href="/dashboard"
            className="text-sm text-[--color-text-secondary] hover:text-[--color-text-primary]"
          >
            ← Dashboard
          </a>
          <h1 className="text-base font-semibold text-[--color-text-primary]">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <section>
          <h2 className="mb-1 text-xl font-bold text-[--color-text-primary]">API Keys</h2>
          <p className="mb-6 text-sm text-[--color-text-secondary]">
            Use API keys to authenticate the Chrome extension or any external client. The key is
            shown once — store it securely.
          </p>

          {/* Generate new key */}
          <div className="mb-6 rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <form onSubmit={handleGenerate} className="flex gap-2">
              <input
                type="text"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                placeholder='Label (e.g. "Chrome Extension")'
                className="flex-1 rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-primary] outline-none placeholder:text-[--color-text-tertiary] focus:border-[--color-accent]"
              />
              <button
                type="submit"
                disabled={createApiKey.isPending}
                className="rounded-lg bg-[--color-accent] px-4 py-2 text-sm font-medium text-[--color-accent-fg] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Generate Key
              </button>
            </form>
          </div>

          {/* Show generated key once */}
          {generatedKey && (
            <div className="mb-6 rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="mb-2 text-xs font-medium text-[--color-text-secondary]">
                Your new API key — copy it now, it won&apos;t be shown again:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 font-mono text-xs text-[--color-text-primary]">
                  {generatedKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-secondary] transition-colors hover:text-[--color-text-primary]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => setGeneratedKey(null)}
                className="mt-2 text-xs text-[--color-text-tertiary] hover:text-[--color-text-secondary]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Existing keys */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-[--color-surface]" />
              ))}
            </div>
          ) : apiKeys?.length === 0 ? (
            <p className="py-8 text-center text-sm text-[--color-text-tertiary]">
              No API keys yet.
            </p>
          ) : (
            <div className="space-y-2">
              {apiKeys?.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-xl border border-[--color-border] bg-[--color-surface] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                >
                  <div>
                    <p className="text-sm font-medium text-[--color-text-primary]">{key.label}</p>
                    <p className="text-xs text-[--color-text-tertiary]">
                      Created{" "}
                      {new Date(key.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(key)}
                    className="rounded-lg px-2 py-1 text-sm text-[--color-text-tertiary] transition-colors hover:bg-[--color-bg] hover:text-[--color-danger]"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
