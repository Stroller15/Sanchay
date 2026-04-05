"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/use-current-user";
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

  useCurrentUser();

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

  const userInitial = (session?.user?.name ?? session?.user?.email ?? "?")[0]?.toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[--color-bg]">
      <CollectionSidebar
        selectedCollectionId={selectedCollectionId}
        onSelect={setSelectedCollectionId}
      />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-end border-b border-[--color-border] bg-[--color-surface] px-5 py-3">
          <div className="flex items-center gap-1.5">
            <a
              href="/settings"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[--color-text-secondary] transition-colors hover:bg-[--color-bg] hover:text-[--color-text-primary]"
            >
              Settings
            </a>
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="h-7 w-7 rounded-full ring-1 ring-[--color-border]"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[--color-accent] text-xs font-semibold text-white">
                {userInitial}
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-[--color-text-secondary] transition-colors hover:bg-[--color-bg] hover:text-[--color-text-primary]"
            >
              Sign out
            </button>
          </div>
        </header>

        <PasteBar defaultCollectionId={selectedCollectionId} />

        {/* Search + tag filter */}
        <div className="flex items-center gap-3 border-b border-[--color-border] bg-[--color-surface] px-5 py-2.5">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="flex cursor-pointer items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 transition-colors hover:bg-green-200"
            >
              #{activeTag}
              <span className="ml-1 opacity-60">×</span>
            </button>
          )}
        </div>

        {/* Green gradient wash — matches Vamo style */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-green-100/40 via-green-50/20 to-transparent" />

        {/* Resource grid */}
        <div className="relative flex-1 overflow-y-auto p-5">
          <ResourceGrid
            resources={data?.data ?? []}
            isLoading={isLoading}
            hasFilters={hasFilters}
            onTagClick={handleTagClick}
          />
          {data && data.totalPages > 1 && (
            <p className="mt-6 text-center text-xs text-[--color-text-tertiary]">
              Showing {data.data.length} of {data.total} resources
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
