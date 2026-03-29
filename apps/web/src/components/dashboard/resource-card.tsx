"use client";

import { useState } from "react";
import { useDeleteResource, useUpdateResource } from "@/hooks/use-resources";
import { useCollections } from "@/hooks/use-collections";
import type { Resource } from "@sanchay/types";

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
      <div className="group relative rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
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
            className="mt-0.5 hidden h-5 w-5 shrink-0 items-center justify-center rounded bg-[--color-pill-bg] text-xs font-bold text-[--color-text-tertiary]"
            aria-hidden="true"
          >
            {resource.title[0]?.toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-2 text-sm font-medium leading-snug text-[--color-text-primary] hover:text-[--color-text-secondary]"
            >
              {resource.title}
            </a>
            <p className="mt-0.5 truncate text-xs text-[--color-text-tertiary]">{hostname}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-1.5 text-[--color-text-tertiary] transition-colors hover:bg-[--color-bg] hover:text-[--color-text-primary]"
              title="Edit"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg p-1.5 text-[--color-text-tertiary] transition-colors hover:bg-[--color-bg] hover:text-[--color-danger]"
              title="Delete"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-full bg-[--color-pill-bg] px-2 py-0.5 text-xs font-medium text-[--color-text-secondary]">
            {resource.type}
          </span>
          {resource.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="inline-flex items-center rounded-full bg-[--color-pill-bg] px-2 py-0.5 text-xs text-[--color-text-secondary] transition-colors hover:text-[--color-text-primary]"
            >
              #{tag}
            </button>
          ))}
        </div>

        {resource.notes && (
          <p className="mt-2 line-clamp-2 text-xs text-[--color-text-secondary]">
            {resource.notes}
          </p>
        )}

        <p className="mt-2 text-xs text-[--color-text-tertiary]">{savedDate}</p>
      </div>

      {/* Edit drawer */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center"
          onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}
        >
          <div className="w-full rounded-t-2xl border border-[--color-border] bg-[--color-surface] p-6 shadow-xl sm:max-w-lg sm:rounded-xl">
            <h3 className="mb-4 text-base font-semibold text-[--color-text-primary]">
              Edit Resource
            </h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[--color-text-tertiary]">
                  Collection
                </label>
                <select
                  value={editCollectionId}
                  onChange={(e) => setEditCollectionId(e.target.value)}
                  className="w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-primary] outline-none focus:border-[--color-text-secondary]"
                >
                  {collections?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[--color-text-tertiary]">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="react, frontend, tutorial"
                  className="w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-primary] outline-none placeholder:text-[--color-text-tertiary] focus:border-[--color-text-secondary]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[--color-text-tertiary]">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Optional notes…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-primary] outline-none placeholder:text-[--color-text-tertiary] focus:border-[--color-text-secondary]"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleSave}
                disabled={updateResource.isPending}
                className="flex-1 rounded-[10px] bg-[--color-accent] px-4 py-2 text-sm font-medium text-[--color-accent-fg] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {updateResource.isPending ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-[10px] border border-[--color-border] px-4 py-2 text-sm text-[--color-text-secondary] transition-colors hover:bg-[--color-bg]"
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
