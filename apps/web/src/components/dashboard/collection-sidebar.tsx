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
    <aside className="flex h-full w-52 shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#111111]">
      <div className="px-4 py-3.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Collections
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <button
          onClick={() => onSelect(null)}
          className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
            selectedCollectionId === null
              ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200"
          }`}
        >
          <span className="text-base">🗂️</span>
          <span className="flex-1 text-left">All Resources</span>
        </button>

        {isLoading && (
          <div className="mt-1 space-y-1 px-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        )}

        <div className="mt-0.5 space-y-0.5">
          {collections?.map((collection) => (
            <div key={collection.id} className="group relative">
              <button
                onClick={() => onSelect(collection.id)}
                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 pr-7 text-sm transition-colors ${
                  selectedCollectionId === collection.id
                    ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200"
                }`}
              >
                <span className="text-base">{collection.emoji}</span>
                <span className="flex-1 truncate text-left">{collection.name}</span>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                  {collection._count?.resources ?? 0}
                </span>
              </button>
              {collection.name !== "Unsorted" && (
                <button
                  onClick={() => handleDelete(collection)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-xs text-neutral-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100 dark:text-neutral-600 dark:hover:text-red-400"
                  title="Delete collection"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-neutral-200 p-2.5 dark:border-neutral-800">
        {isCreating ? (
          <form onSubmit={handleCreate} className="flex gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 rounded-md border border-neutral-200 bg-transparent px-2.5 py-1.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-neutral-500"
              onKeyDown={(e) => e.key === "Escape" && setIsCreating(false)}
            />
            <button
              type="submit"
              className="rounded-md px-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full rounded-md px-2.5 py-1.5 text-left text-sm text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          >
            + New Collection
          </button>
        )}
      </div>
    </aside>
  );
}
