"use client";

import { useState } from "react";
import { useCollections, useCreateCollection, useDeleteCollection } from "@/hooks/use-collections";
import type { Collection } from "@sanchay/types";

interface CollectionSidebarProps {
  selectedCollectionId: string | null;
  onSelect: (id: string | null) => void;
}

export function CollectionSidebar({ selectedCollectionId, onSelect }: CollectionSidebarProps) {
  const { data: collections, isLoading } = useCollections();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createCollection.mutateAsync({ name: newName.trim() });
    setNewName("");
    setIsCreating(false);
  }

  async function handleDelete(collection: Collection) {
    if (collection.name === "Unsorted") return;
    if (!confirm(`Delete "${collection.name}"? Resources will move to Unsorted.`)) return;
    if (selectedCollectionId === collection.id) onSelect(null);
    await deleteCollection.mutateAsync(collection.id);
  }

  return (
    <aside className="flex h-full w-52 shrink-0 flex-col border-r border-[--color-border] bg-[--color-surface]">
      <div className="px-4 py-4">
        <span className="text-lg font-bold text-[--color-text-primary]">Sanchay</span>
      </div>

      <div className="px-3 pb-2">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-widest text-[--color-text-tertiary]">
          Collections
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <button
          onClick={() => onSelect(null)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
            selectedCollectionId === null
              ? "bg-[--color-bg] font-medium text-[--color-text-primary]"
              : "text-[--color-text-secondary] hover:bg-[--color-bg] hover:text-[--color-text-primary]"
          }`}
        >
          <span className="text-base">🗂️</span>
          <span className="flex-1 text-left">All Resources</span>
        </button>

        {isLoading && (
          <div className="mt-1 space-y-1 px-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-[--color-bg]" />
            ))}
          </div>
        )}

        <div className="mt-0.5 space-y-0.5">
          {collections?.map((collection) => (
            <div key={collection.id} className="group relative">
              <button
                onClick={() => onSelect(collection.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 pr-7 text-sm transition-colors ${
                  selectedCollectionId === collection.id
                    ? "bg-[--color-bg] font-medium text-[--color-text-primary]"
                    : "text-[--color-text-secondary] hover:bg-[--color-bg] hover:text-[--color-text-primary]"
                }`}
              >
                <span className="text-base">{collection.emoji}</span>
                <span className="flex-1 truncate text-left">{collection.name}</span>
                <span className="rounded-full bg-[--color-pill-bg] px-1.5 py-0.5 text-[10px] text-[--color-text-tertiary]">
                  {collection._count?.resources ?? 0}
                </span>
              </button>
              {collection.name !== "Unsorted" && (
                <button
                  onClick={() => handleDelete(collection)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-[--color-text-tertiary] opacity-0 transition-all hover:text-[--color-danger] group-hover:opacity-100"
                  title="Delete collection"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-[--color-border] p-2.5">
        {isCreating ? (
          <form onSubmit={handleCreate} className="flex gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 rounded-lg border border-[--color-border] bg-[--color-bg] px-2.5 py-1.5 text-sm text-[--color-text-primary] outline-none placeholder:text-[--color-text-tertiary] focus:border-[--color-text-secondary]"
              onKeyDown={(e) => e.key === "Escape" && setIsCreating(false)}
            />
            <button
              type="submit"
              className="rounded-lg px-2 text-sm font-medium text-[--color-text-primary] hover:text-[--color-text-secondary]"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full rounded-lg border border-dashed border-[--color-border] px-2.5 py-1.5 text-left text-sm text-[--color-text-tertiary] transition-colors hover:border-[--color-text-tertiary] hover:text-[--color-text-secondary]"
          >
            + New Collection
          </button>
        )}
      </div>
    </aside>
  );
}
