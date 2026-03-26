"use client";

import { useState, useCallback, useRef } from "react";
import { useMetadataPreview, useCreateResource } from "@/hooks/use-resources";
import { useCollections } from "@/hooks/use-collections";

interface PasteBarProps {
  defaultCollectionId?: string | null;
}

export function PasteBar({ defaultCollectionId }: PasteBarProps) {
  const [url, setUrl] = useState("");
  const [validUrl, setValidUrl] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const createResource = useCreateResource();
  const { data: collections } = useCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>(
    defaultCollectionId ?? undefined,
  );

  const { data: preview, isFetching: previewLoading } = useMetadataPreview(validUrl);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      try {
        new URL(val);
        setValidUrl(val);
      } catch {
        setValidUrl(null);
      }
    }, 300);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      new URL(url);
    } catch {
      return; // invalid URL, let native validation handle it
    }

    await createResource.mutateAsync({
      url,
      collectionId: selectedCollectionId,
    });

    setUrl("");
    setValidUrl(null);
  }

  return (
    <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
      <form onSubmit={handleSave} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={handleChange}
            placeholder="Paste a URL to save — GitHub, YouTube, PDF, article…"
            className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-700 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-500"
          />
          {validUrl && (
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              {previewLoading ? (
                <span className="animate-pulse text-xs text-neutral-400">Fetching…</span>
              ) : preview ? (
                <span className="flex max-w-[200px] items-center gap-1 truncate text-xs text-neutral-500">
                  {preview.favicon && (
                    <img
                      src={preview.favicon}
                      alt=""
                      className="h-3 w-3"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  )}
                  {preview.title}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <select
          value={selectedCollectionId ?? ""}
          onChange={(e) => setSelectedCollectionId(e.target.value || undefined)}
          className="rounded-lg border border-neutral-200 bg-transparent px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors focus:border-blue-500 dark:border-neutral-700 dark:text-white dark:focus:border-blue-500"
        >
          <option value="">Unsorted</option>
          {collections?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!url.trim() || createResource.isPending}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createResource.isPending ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
