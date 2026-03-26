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
      className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
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

  // Creates user + Unsorted collection on first login
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
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-[#0a0a0a]">
      <CollectionSidebar
        selectedCollectionId={selectedCollectionId}
        onSelect={setSelectedCollectionId}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3 dark:border-neutral-800 dark:bg-[#111111]">
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            Sanchay
          </span>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <a
              href="/settings"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              Settings
            </a>
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="h-7 w-7 rounded-full ring-1 ring-neutral-200 dark:ring-neutral-700"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                {userInitial}
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              Sign out
            </button>
          </div>
        </header>

        <PasteBar defaultCollectionId={selectedCollectionId} />

        {/* Search + tag filter */}
        <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-5 py-2.5 dark:border-neutral-800 dark:bg-[#111111]">
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          {activeTag && (
            <button
              onClick={() => setActiveTag(null)}
              className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
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
            <p className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-600">
              Showing {data.data.length} of {data.total} resources
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
