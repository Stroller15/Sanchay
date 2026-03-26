"use client";

import { useState } from "react";
import { useDeleteResource, useUpdateResource } from "@/hooks/use-resources";
import { useCollections } from "@/hooks/use-collections";
import type { Resource } from "@sanchay/types";

const TYPE_COLORS: Record<string, string> = {
  github: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  video: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  pdf: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  article: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  other: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

interface ResourceCardProps {
  resource: Resource;
  onTagClick?: (tag: string) => void;
}

export function ResourceCard({ resource, onTagClick }: ResourceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteResource = useDeleteResource();
  const updateResource = useUpdateResource();
  const { data: collections } = useCollections();

  const [editNotes, setEditNotes] = useState(resource.notes ?? "");
  const [editTags, setEditTags] = useState(resource.tags.join(", "));
  const [editCollectionId, setEditCollectionId] = useState(resource.collectionId);

  const hostname = (() => {
    try {
      return new URL(resource.url).hostname;
    } catch {
      return resource.url;
    }
  })();

  async function handleDelete() {
    if (!confirm("Delete this resource?")) return;
    await deleteResource.mutateAsync(resource.id);
  }

  async function handleSave() {
    await updateResource.mutateAsync({
      id: resource.id,
      data: {
        notes: editNotes || null,
        tags: editTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        collectionId: editCollectionId,
      },
    });
    setIsEditing(false);
  }

  const savedDate = new Date(resource.savedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <div className="group relative rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-start gap-3">
          {resource.favicon ? (
            <img
              src={resource.favicon}
              alt=""
              className="mt-0.5 h-5 w-5 shrink-0 rounded"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
                if (img.nextSibling) (img.nextSibling as HTMLElement).style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="mt-0.5 hidden h-5 w-5 shrink-0 items-center justify-center rounded bg-neutral-200 text-xs font-bold text-neutral-500 dark:bg-neutral-700"
            aria-hidden="true"
          >
            {resource.title[0]?.toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900 hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400"
            >
              {resource.title}
            </a>
            <p className="mt-0.5 truncate text-xs text-neutral-400">{hostname}</p>
          </div>

          {/* Kebab menu */}
          <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded p-1.5 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-1.5 text-sm text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Type tag */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[resource.type] ?? TYPE_COLORS.other}`}
          >
            {resource.type}
          </span>
          {resource.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              #{tag}
            </button>
          ))}
        </div>

        {resource.notes && (
          <p className="mt-2 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
            {resource.notes}
          </p>
        )}

        <p className="mt-2 text-xs text-neutral-300 dark:text-neutral-600">{savedDate}</p>
      </div>

      {/* Edit drawer */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}
        >
          <div className="w-full rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-xl dark:bg-neutral-900">
            <h3 className="mb-4 text-base font-semibold">Edit Resource</h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Collection
                </label>
                <select
                  value={editCollectionId}
                  onChange={(e) => setEditCollectionId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-700"
                >
                  {collections?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="react, frontend, tutorial"
                  className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Optional notes…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-neutral-700"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleSave}
                disabled={updateResource.isPending}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {updateResource.isPending ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
