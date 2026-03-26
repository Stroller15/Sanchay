"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useResources } from "@/hooks/use-resources";
import { CollectionSidebar } from "@/components/dashboard/collection-sidebar";
import { PasteBar } from "@/components/dashboard/paste-bar";
import { SearchBar } from "@/components/dashboard/search-bar";
import { ResourceGrid } from "@/components/dashboard/resource-grid";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  if (status === "unauthenticated") {
    redirect("/");
  }

  const { data, isLoading } = useResources({
    q: searchQuery || undefined,
    collection: selectedCollectionId ?? undefined,
    tag: activeTag ?? undefined,
    pageSize: 50,
  });

  const hasFilters = Boolean(searchQuery || activeTag || selectedCollectionId);

  function handleTagClick(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <CollectionSidebar
        selectedCollectionId={selectedCollectionId}
        onSelect={setSelectedCollectionId}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-base font-semibold">Sanchay</h1>
          <div className="flex items-center gap-3">
            <a
              href="/settings"
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Settings
            </a>
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="h-7 w-7 rounded-full"
              />
            )}
            <button
              onClick={() => signOut()}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Paste bar */}
        <PasteBar defaultCollectionId={selectedCollectionId} />

        {/* Search + tag filter */}
        <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              #{activeTag} ×
            </button>
          )}
        </div>

        {/* Resource grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <ResourceGrid
            resources={data?.data ?? []}
            isLoading={isLoading}
            hasFilters={hasFilters}
            onTagClick={handleTagClick}
          />

          {data && data.totalPages > 1 && (
            <p className="mt-6 text-center text-xs text-neutral-400">
              Showing {data.data.length} of {data.total} resources
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
