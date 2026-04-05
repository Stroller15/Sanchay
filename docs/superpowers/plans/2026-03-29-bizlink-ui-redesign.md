# BizLink UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply BizLink-inspired visual style (warm off-white palette, Inter font, neutral black CTAs, subtle card shadows) across all pages while keeping existing layout and functionality intact.

**Architecture:** Update CSS design tokens in `globals.css`, swap Geist → Inter in `layout.tsx`, then refresh Tailwind classes in each component/page to use the new tokens. No functional changes — visual layer only.

**Tech Stack:** Next.js 15, Tailwind CSS v4, `next/font/google` (Inter), next-themes

---

## File Map

| File                                                       | Change                                                |
| ---------------------------------------------------------- | ----------------------------------------------------- |
| `apps/web/src/app/globals.css`                             | Replace all color tokens with warm neutral palette    |
| `apps/web/src/app/layout.tsx`                              | Swap GeistSans/GeistMono → Inter                      |
| `apps/web/src/components/ui/button.tsx`                    | Update variant classes to use token colors            |
| `apps/web/src/components/dashboard/collection-sidebar.tsx` | Replace hardcoded Tailwind colors with token classes  |
| `apps/web/src/components/dashboard/paste-bar.tsx`          | Replace blue focus/button with neutral tokens         |
| `apps/web/src/components/dashboard/search-bar.tsx`         | Replace blue focus with neutral tokens                |
| `apps/web/src/components/dashboard/resource-card.tsx`      | Replace colored type badges + blue hover with neutral |
| `apps/web/src/app/dashboard/page.tsx`                      | Replace hardcoded colors, update header/toolbar       |
| `apps/web/src/app/settings/page.tsx`                       | Replace blue buttons/inputs with token colors         |
| `apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`  | Wrap in card, warm bg, neutral buttons                |
| `apps/web/src/app/page.tsx`                                | Replace blue CTA with dark neutral button             |

---

## Task 1: Update design tokens in globals.css

**Files:**

- Modify: `apps/web/src/app/globals.css`

- [ ] **Step 1: Replace globals.css entirely**

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;

  /* Light mode tokens */
  --color-bg: #f5f4f0;
  --color-surface: #ffffff;
  --color-border: #e8e6e1;

  --color-text-primary: #111110;
  --color-text-secondary: #6b6965;
  --color-text-tertiary: #9b9895;

  --color-accent: #111110;
  --color-accent-fg: #ffffff;

  --color-pill-bg: #f0efeb;

  --color-danger: #dc2626;
  --color-success: #16a34a;
}

@layer base {
  :root {
    color-scheme: light dark;
  }

  html {
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: #f5f4f0;
    color: #111110;
    font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  }

  .dark body {
    background-color: #0f0e0d;
    color: #f5f4f0;
  }
}

/* Dark mode overrides */
.dark {
  --color-bg: #0f0e0d;
  --color-surface: #1c1b1a;
  --color-border: #2c2a28;

  --color-text-primary: #f5f4f0;
  --color-text-secondary: #a09d99;
  --color-text-tertiary: #6b6965;

  --color-accent: #f5f4f0;
  --color-accent-fg: #111110;

  --color-pill-bg: #252321;

  --color-danger: #dc2626;
}
```

- [ ] **Step 2: Verify no compile errors**

Run: `pnpm --filter @sanchay/web build 2>&1 | head -30`
Expected: No CSS parse errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/globals.css
git commit -m "feat(web): update design tokens to BizLink warm neutral palette"
```

---

## Task 2: Swap font from Geist to Inter

**Files:**

- Modify: `apps/web/src/app/layout.tsx`

- [ ] **Step 1: Update layout.tsx**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sanchay — Save, organize, find",
  description:
    "Your personal resource manager. Save any URL, organize by collection, find anything instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm --filter @sanchay/web build 2>&1 | head -30`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/layout.tsx
git commit -m "feat(web): switch font from Geist to Inter"
```

---

## Task 3: Update Button component

**Files:**

- Modify: `apps/web/src/components/ui/button.tsx`

- [ ] **Step 1: Update button.tsx**

```tsx
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-[--color-accent] text-[--color-accent-fg] hover:opacity-90",
  destructive: "bg-[--color-danger] text-white hover:opacity-90",
  outline:
    "border border-[--color-border] bg-transparent text-[--color-text-secondary] hover:bg-[--color-bg]",
  ghost:
    "bg-transparent text-[--color-text-secondary] hover:bg-[--color-bg] hover:text-[--color-text-primary]",
  link: "text-[--color-text-primary] underline-offset-4 hover:underline",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-9 px-4 py-2 rounded-[10px]",
  sm: "h-8 px-3 rounded-lg",
  lg: "h-11 px-8 rounded-[10px]",
  icon: "h-9 w-9 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-border] disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/ui/button.tsx
git commit -m "feat(web): update Button variants to neutral BizLink style"
```

---

## Task 4: Update CollectionSidebar

**Files:**

- Modify: `apps/web/src/components/dashboard/collection-sidebar.tsx`

- [ ] **Step 1: Replace collection-sidebar.tsx**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/dashboard/collection-sidebar.tsx
git commit -m "feat(web): refresh CollectionSidebar with BizLink neutral style"
```

---

## Task 5: Update Dashboard page (header + toolbar)

**Files:**

- Modify: `apps/web/src/app/dashboard/page.tsx`

- [ ] **Step 1: Replace dashboard/page.tsx**

```tsx
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
        <header className="flex items-center justify-between border-b border-[--color-border] bg-[--color-surface] px-5 py-3">
          <div className="flex-1" />
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/dashboard/page.tsx
git commit -m "feat(web): refresh dashboard header and toolbar with BizLink style"
```

---

## Task 6: Update PasteBar

**Files:**

- Modify: `apps/web/src/components/dashboard/paste-bar.tsx`

- [ ] **Step 1: Replace paste-bar.tsx**

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { useMetadataPreview, useCreateResource } from "@/hooks/use-resources";
import { useCollections } from "@/hooks/use-collections";

interface PasteBarProps {
  defaultCollectionId?: string | null;
}

export function PasteBar({ defaultCollectionId }: PasteBarProps) {
  const [url, setUrl] = useState("");
  const [validUrl, setValidUrl] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const createResource = useCreateResource();
  const { data: collections } = useCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>(
    defaultCollectionId ?? undefined,
  );

  const { data: preview, isFetching: previewLoading } = useMetadataPreview(validUrl);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      try {
        new URL(val);
        setValidUrl(val);
      } catch {
        setValidUrl(null);
      }
    }, 300);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      new URL(url);
    } catch {
      return;
    }

    await createResource.mutateAsync({
      url,
      collectionId: selectedCollectionId,
    });

    setUrl("");
    setValidUrl(null);
  }

  return (
    <div className="border-b border-[--color-border] bg-[--color-surface] p-4">
      <form onSubmit={handleSave} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={handleChange}
            placeholder="Paste a URL to save — GitHub, YouTube, PDF, article…"
            className="w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-4 py-2.5 text-sm text-[--color-text-primary] outline-none transition-colors placeholder:text-[--color-text-tertiary] focus:border-[--color-text-secondary]"
          />
          {validUrl && (
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              {previewLoading ? (
                <span className="animate-pulse text-xs text-[--color-text-tertiary]">
                  Fetching…
                </span>
              ) : preview ? (
                <span className="flex max-w-[200px] items-center gap-1 truncate text-xs text-[--color-text-secondary]">
                  {preview.favicon && (
                    <img
                      src={preview.favicon}
                      alt=""
                      className="h-3 w-3"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  )}
                  {preview.title}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <select
          value={selectedCollectionId ?? ""}
          onChange={(e) => setSelectedCollectionId(e.target.value || undefined)}
          className="rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2.5 text-sm text-[--color-text-primary] outline-none transition-colors focus:border-[--color-text-secondary]"
        >
          <option value="">Unsorted</option>
          {collections?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!url.trim() || createResource.isPending}
          className="rounded-[10px] bg-[--color-accent] px-4 py-2.5 text-sm font-medium text-[--color-accent-fg] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {createResource.isPending ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/dashboard/paste-bar.tsx
git commit -m "feat(web): refresh PasteBar with neutral token styles"
```

---

## Task 7: Update SearchBar

**Files:**

- Modify: `apps/web/src/components/dashboard/search-bar.tsx`

- [ ] **Step 1: Replace search-bar.tsx**

```tsx
"use client";

import { useCallback, useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search by title, URL, or notes…",
}: SearchBarProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(val), 300);
    },
    [onChange],
  );

  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[--color-text-tertiary]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-[--color-border] bg-[--color-bg] py-2 pl-9 pr-4 text-sm text-[--color-text-primary] outline-none transition-colors placeholder:text-[--color-text-tertiary] focus:border-[--color-text-secondary]"
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            const input = document.querySelector('input[type="search"]') as HTMLInputElement;
            if (input) input.value = "";
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[--color-text-tertiary] hover:text-[--color-text-primary]"
        >
          ×
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/dashboard/search-bar.tsx
git commit -m "feat(web): refresh SearchBar with pill shape and neutral tokens"
```

---

## Task 8: Update ResourceCard

**Files:**

- Modify: `apps/web/src/components/dashboard/resource-card.tsx`

- [ ] **Step 1: Replace resource-card.tsx**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/dashboard/resource-card.tsx
git commit -m "feat(web): refresh ResourceCard with neutral pills, SVG icons, subtle shadow"
```

---

## Task 9: Update Settings page

**Files:**

- Modify: `apps/web/src/app/settings/page.tsx`

- [ ] **Step 1: Replace settings/page.tsx**

```tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "@/hooks/use-api-keys";
import type { ApiKey } from "@sanchay/types";

export default function SettingsPage() {
  const { status } = useSession();
  const { data: apiKeys, isLoading } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (status === "unauthenticated") {
    redirect("/");
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const result = await createApiKey.mutateAsync(newKeyLabel || "API Key");
    setGeneratedKey(result.key);
    setNewKeyLabel("");
  }

  async function handleCopy() {
    if (!generatedKey) return;
    await navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete(key: ApiKey) {
    if (!confirm(`Revoke API key "${key.label}"?`)) return;
    await deleteApiKey.mutateAsync(key.id);
  }

  return (
    <div className="min-h-screen bg-[--color-bg]">
      <header className="border-b border-[--color-border] bg-[--color-surface] px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <a
            href="/dashboard"
            className="text-sm text-[--color-text-secondary] hover:text-[--color-text-primary]"
          >
            ← Dashboard
          </a>
          <h1 className="text-base font-semibold text-[--color-text-primary]">Settings</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <section>
          <h2 className="mb-1 text-xl font-bold text-[--color-text-primary]">API Keys</h2>
          <p className="mb-6 text-sm text-[--color-text-secondary]">
            Use API keys to authenticate the Chrome extension or any external client. The key is
            shown once — store it securely.
          </p>

          {/* Generate new key */}
          <div className="mb-6 rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <form onSubmit={handleGenerate} className="flex gap-2">
              <input
                type="text"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                placeholder='Label (e.g. "Chrome Extension")'
                className="flex-1 rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-primary] outline-none placeholder:text-[--color-text-tertiary] focus:border-[--color-text-secondary]"
              />
              <button
                type="submit"
                disabled={createApiKey.isPending}
                className="rounded-[10px] bg-[--color-accent] px-4 py-2 text-sm font-medium text-[--color-accent-fg] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Generate Key
              </button>
            </form>
          </div>

          {/* Show generated key once */}
          {generatedKey && (
            <div className="mb-6 rounded-xl border border-[--color-border] bg-[--color-surface] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="mb-2 text-xs font-medium text-[--color-text-secondary]">
                Your new API key — copy it now, it won&apos;t be shown again:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 font-mono text-xs text-[--color-text-primary]">
                  {generatedKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-secondary] transition-colors hover:text-[--color-text-primary]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => setGeneratedKey(null)}
                className="mt-2 text-xs text-[--color-text-tertiary] hover:text-[--color-text-secondary]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Existing keys */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-[--color-surface]" />
              ))}
            </div>
          ) : apiKeys?.length === 0 ? (
            <p className="py-8 text-center text-sm text-[--color-text-tertiary]">
              No API keys yet.
            </p>
          ) : (
            <div className="space-y-2">
              {apiKeys?.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-xl border border-[--color-border] bg-[--color-surface] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                >
                  <div>
                    <p className="text-sm font-medium text-[--color-text-primary]">{key.label}</p>
                    <p className="text-xs text-[--color-text-tertiary]">
                      Created{" "}
                      {new Date(key.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(key)}
                    className="rounded-lg px-2 py-1 text-sm text-[--color-text-tertiary] transition-colors hover:bg-[--color-bg] hover:text-[--color-danger]"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/settings/page.tsx
git commit -m "feat(web): refresh Settings page with neutral BizLink style"
```

---

## Task 10: Update Sign-in page

**Files:**

- Modify: `apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

- [ ] **Step 1: Replace sign-in page**

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const isDev = process.env.NODE_ENV === "development";

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password: "dev",
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--color-bg]">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[--color-text-primary]">Sanchay</h1>
          <p className="text-sm text-[--color-text-secondary]">
            Sign in to your account to continue
          </p>
        </div>

        <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {isDev && (
            <form onSubmit={handleDevLogin} className="mb-4 space-y-3 text-left">
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                Dev mode — enter any email to log in
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-[--color-border] bg-[--color-bg] px-3 py-2 text-sm text-[--color-text-primary] outline-none placeholder:text-[--color-text-tertiary] focus:border-[--color-text-secondary]"
              />
              {error && <p className="text-xs text-[--color-danger]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[10px] bg-[--color-accent] px-4 py-2 text-sm font-medium text-[--color-accent-fg] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Signing in…" : "Sign in (dev)"}
              </button>
            </form>
          )}

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex w-full items-center justify-center gap-3 rounded-[10px] border border-[--color-border] bg-[--color-surface] px-4 py-2 text-sm font-medium text-[--color-text-primary] shadow-sm transition-colors hover:bg-[--color-bg]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                fill="#EA4335"
              />
              <path
                d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                fill="#4285F4"
              />
              <path
                d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.70496L1.275 6.60995C0.46 8.22995 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                fill="#FBBC05"
              />
              <path
                d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                fill="#34A853"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
git commit -m "feat(web): refresh sign-in page with card layout and neutral style"
```

---

## Task 11: Update Landing page

**Files:**

- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: Replace page.tsx**

```tsx
"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[--color-bg] p-24">
      <div className="max-w-lg text-center">
        <h1 className="text-5xl font-bold tracking-tight text-[--color-text-primary]">Sanchay</h1>
        <p className="mt-4 text-lg text-[--color-text-secondary]">
          Save any URL. Organize by collection. Find anything instantly.
        </p>
        <p className="mt-2 text-sm text-[--color-text-tertiary]">
          GitHub repos, YouTube videos, PDFs, articles — one place for everything.
        </p>

        <div className="mt-10">
          {status === "loading" ? (
            <div className="mx-auto h-10 w-32 animate-pulse rounded-[10px] bg-[--color-surface]" />
          ) : session ? (
            <a
              href="/dashboard"
              className="inline-flex items-center rounded-[10px] bg-[--color-accent] px-6 py-3 text-sm font-semibold text-[--color-accent-fg] transition-opacity hover:opacity-90"
            >
              Open Dashboard →
            </a>
          ) : (
            <button
              onClick={() => signIn()}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[--color-accent] px-6 py-3 text-sm font-semibold text-[--color-accent-fg] transition-opacity hover:opacity-90"
            >
              Get Started →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat(web): refresh landing page with neutral BizLink style"
```

---

## Task 12: Final build verification

- [ ] **Step 1: Run type check**

Run: `pnpm type-check`
Expected: No type errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No lint errors

- [ ] **Step 3: Build**

Run: `pnpm --filter @sanchay/web build`
Expected: Build succeeds with no errors
