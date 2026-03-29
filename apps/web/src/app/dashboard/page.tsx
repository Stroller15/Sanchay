"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useResources } from "@/hooks/use-resources";
import { CollectionSidebar } from "@/components/dashboard/collection-sidebar";
import { PasteBar } from "@/components/dashboard/paste-bar";
import { SearchBar } from "@/components/dashboard/search-bar";
import { ResourceGrid } from "@/components/dashboard/resource-grid";
import { redirect } from "next/navigation";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-lg p-1.5 text-[--color-text-secondary] transition-colors hover:bg-[--color-bg] hover:text-[--color-text-primary]"
      title="Toggle theme"
    >
      <svg
        className="hidden h-4 w-4 dark:block"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <svg
        className="block h-4 w-4 dark:hidden"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </button>
  );
}

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

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-end border-b border-[--color-border] bg-[--color-surface] px-5 py-3">
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
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
                className="h-7 w-7 rounded-lg ring-1 ring-[--color-border]"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[--color-pill-bg] text-xs font-semibold text-[--color-text-secondary]">
                {userInitial}
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[--color-text-secondary] transition-colors hover:bg-[--color-bg] hover:text-[--color-text-primary]"
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
              className="flex items-center gap-1 rounded-full bg-[--color-pill-bg] px-3 py-1 text-sm font-medium text-[--color-text-secondary] transition-colors hover:text-[--color-text-primary]"
            >
              #{activeTag}
              <span className="ml-1 opacity-60">×</span>
            </button>
          )}
        </div>

        {/* Resource grid */}
        <div className="flex-1 overflow-y-auto p-5">
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
