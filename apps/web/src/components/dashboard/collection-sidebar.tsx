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
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-neutral-200 dark:border-neutral-800">
      <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Collections
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {/* All resources */}
        <button
          onClick={() => onSelect(null)}
          className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
            selectedCollectionId === null
              ? "bg-neutral-100 font-medium dark:bg-neutral-800"
              : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
          }`}
        >
          <span>🗂️</span>
          <span className="flex-1 text-left">All Resources</span>
        </button>

        {isLoading && (
          <div className="mt-1 space-y-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        )}

        <div className="mt-1 space-y-0.5">
          {collections?.map((collection) => (
            <div key={collection.id} className="group relative">
              <button
                onClick={() => onSelect(collection.id)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 pr-8 text-sm transition-colors ${
                  selectedCollectionId === collection.id
                    ? "bg-neutral-100 font-medium dark:bg-neutral-800"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                }`}
              >
                <span>{collection.emoji}</span>
                <span className="flex-1 truncate text-left">{collection.name}</span>
                <span className="text-xs text-neutral-400">
                  {collection._count?.resources ?? 0}
                </span>
              </button>
              {collection.name !== "Unsorted" && (
                <button
                  onClick={() => handleDelete(collection)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-neutral-400 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                  title="Delete collection"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        {isCreating ? (
          <form onSubmit={handleCreate} className="flex gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700"
              onKeyDown={(e) => e.key === "Escape" && setIsCreating(false)}
            />
            <button
              type="submit"
              className="px-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full rounded px-3 py-1.5 text-left text-sm text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:hover:bg-neutral-900 dark:hover:text-neutral-300"
          >
            + New Collection
          </button>
        )}
      </div>
    </aside>
  );
}
