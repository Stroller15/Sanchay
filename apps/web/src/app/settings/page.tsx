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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <a
            href="/dashboard"
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            ← Dashboard
          </a>
          <h1 className="text-base font-semibold">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            API Keys
          </h2>
          <p className="mb-4 text-sm text-neutral-500">
            Use API keys to authenticate the Chrome extension or any external client. The key is
            shown once — store it securely.
          </p>

          {/* Generate new key */}
          <form onSubmit={handleGenerate} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
              placeholder='Label (e.g. "Chrome Extension")'
              className="flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-700"
            />
            <button
              type="submit"
              disabled={createApiKey.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              Generate Key
            </button>
          </form>

          {/* Show generated key once */}
          {generatedKey && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <p className="mb-2 text-xs font-medium text-green-700 dark:text-green-300">
                Your new API key — copy it now, it won&apos;t be shown again:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded border border-neutral-200 bg-white px-3 py-2 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-900">
                  {generatedKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg border border-neutral-300 px-3 py-2 text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => setGeneratedKey(null)}
                className="mt-2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Existing keys */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : apiKeys?.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">No API keys yet.</p>
          ) : (
            <div className="space-y-2">
              {apiKeys?.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div>
                    <p className="text-sm font-medium">{key.label}</p>
                    <p className="text-xs text-neutral-400">
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
                    className="rounded px-2 py-1 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
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
