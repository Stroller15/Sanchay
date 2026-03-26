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
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <span className="text-4xl">✅</span>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">Saved! Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-6 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="mb-4 text-base font-semibold">Save to Sanchay</h1>

        <div className="mb-4">
          <p className="mb-1 text-xs text-neutral-500">URL</p>
          <p className="break-all rounded bg-neutral-50 px-3 py-2 font-mono text-sm dark:bg-neutral-800">
            {url || "(none)"}
          </p>
        </div>

        <div className="mb-5">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
            Collection
          </label>
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-700"
          >
            <option value="">Unsorted</option>
            {collections?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!url || createResource.isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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
