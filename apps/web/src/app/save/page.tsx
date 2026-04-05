"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCreateResource } from "@/hooks/use-resources";
import { useCollections } from "@/hooks/use-collections";
import { Suspense } from "react";

function SavePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const createResource = useCreateResource();
  const { data: collections } = useCollections();

  const url = searchParams.get("url") ?? searchParams.get("text") ?? "";
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  async function handleSave() {
    if (!url) {
      setError("No URL provided");
      return;
    }
    try {
      await createResource.mutateAsync({
        url,
        collectionId: selectedCollectionId || undefined,
      });
      setSaved(true);
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch {
      setError("Failed to save. Please try again.");
    }
  }

  if (saved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--color-bg]">
        <div className="text-center">
          <span className="text-4xl">✅</span>
          <p className="mt-3 text-sm text-[--color-text-secondary]">Saved! Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-bg] p-6">
      <div className="w-full max-w-sm rounded-2xl border border-[--color-border] bg-[--color-surface] p-6 shadow-sm">
        <h1 className="mb-4 text-base font-semibold text-[--color-text-primary]">
          Save to Sanchay
        </h1>

        <div className="mb-4">
          <p className="mb-1 text-xs text-[--color-text-tertiary]">URL</p>
          <p className="break-all rounded bg-[--color-bg] px-3 py-2 font-mono text-sm text-[--color-text-primary]">
            {url || "(none)"}
          </p>
        </div>

        <div className="mb-5">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[--color-text-tertiary]">
            Collection
          </label>
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-primary] outline-none focus:border-[--color-accent]"
          >
            <option value="">Unsorted</option>
            {collections?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mb-3 text-xs text-[--color-danger]">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!url || createResource.isPending}
          className="w-full cursor-pointer rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createResource.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function SavePage() {
  return (
    <Suspense>
      <SavePageInner />
    </Suspense>
  );
}
