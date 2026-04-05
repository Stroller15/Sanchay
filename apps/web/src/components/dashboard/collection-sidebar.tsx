"use client";

import { useState } from "react";
import { useCollections, useCreateCollection, useDeleteCollection } from "@/hooks/use-collections";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [confirmCollection, setConfirmCollection] = useState<Collection | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createCollection.mutateAsync({ name: newName.trim() });
    setNewName("");
    setIsCreating(false);
  }

  async function handleDeleteConfirmed() {
    if (!confirmCollection) return;
    if (selectedCollectionId === confirmCollection.id) onSelect(null);
    await deleteCollection.mutateAsync(confirmCollection.id);
    setConfirmCollection(null);
  }

  return (
    <>
      <aside className="flex h-full w-52 shrink-0 flex-col border-r border-[--color-sidebar-border] bg-[--color-sidebar-bg]">
        <div className="px-4 py-4">
          <span className="text-lg font-bold text-[--color-sidebar-text]">Sanchay</span>
        </div>

        <div className="px-3 pb-2">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-widest text-[--color-sidebar-text-muted]">
            Collections
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          <button
            onClick={() => onSelect(null)}
            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
              selectedCollectionId === null
                ? "bg-[--color-sidebar-active] font-medium text-[--color-sidebar-text]"
                : "text-[--color-sidebar-text-muted] hover:bg-[--color-sidebar-active] hover:text-[--color-sidebar-text]"
            }`}
          >
            <span className="text-base">🗂️</span>
            <span className="flex-1 text-left">All Resources</span>
          </button>

          {isLoading && (
            <div className="mt-1 space-y-1 px-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded-lg bg-[--color-sidebar-active]" />
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
                      ? "bg-[--color-sidebar-active] font-medium text-[--color-sidebar-text]"
                      : "text-[--color-sidebar-text-muted] hover:bg-[--color-sidebar-active] hover:text-[--color-sidebar-text]"
                  }`}
                >
                  <span className="text-base">{collection.emoji}</span>
                  <span className="flex-1 truncate text-left">{collection.name}</span>
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-[--color-sidebar-text-muted]">
                    {collection._count?.resources ?? 0}
                  </span>
                </button>
                {collection.name !== "Unsorted" && (
                  <button
                    onClick={() => setConfirmCollection(collection)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-xs text-[--color-sidebar-text-muted] opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                    title="Delete collection"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </nav>

        <div className="p-3">
          {isCreating ? (
            <form onSubmit={handleCreate} className="flex flex-col gap-1.5">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name"
                className="w-full rounded-lg border border-white/40 bg-white/10 px-2.5 py-1.5 text-sm text-[--color-sidebar-text] outline-none placeholder:text-[--color-sidebar-text-muted] focus:border-green-500"
                onKeyDown={(e) => e.key === "Escape" && setIsCreating(false)}
              />
              <div className="flex gap-1">
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-lg bg-green-500 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="cursor-pointer rounded-lg border border-white/20 px-3 py-1.5 text-sm text-[--color-sidebar-text-muted] transition-colors hover:text-[--color-sidebar-text]"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="mb-2 w-full cursor-pointer rounded-lg border border-dashed border-white/20 px-2.5 py-1.5 text-left text-sm text-[--color-sidebar-text-muted] transition-colors hover:border-white/30 hover:text-[--color-sidebar-text]"
            >
              + New Collection
            </button>
          )}
          <button className="w-full cursor-pointer rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Upgrade Now
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmCollection !== null}
        onOpenChange={(open) => !open && setConfirmCollection(null)}
        title="Delete collection"
        description={`Delete "${confirmCollection?.name}"? Resources will move to Unsorted.`}
        confirmLabel="Delete"
        isPending={deleteCollection.isPending}
        onConfirm={handleDeleteConfirmed}
      />
    </>
  );
}
