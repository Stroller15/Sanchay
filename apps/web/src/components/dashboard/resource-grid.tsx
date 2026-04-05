"use client";

import { ResourceCard } from "./resource-card";
import type { Resource } from "@sanchay/types";

interface ResourceGridProps {
  resources: Resource[];
  isLoading: boolean;
  hasFilters: boolean;
  onTagClick?: (tag: string) => void;
}

export function ResourceGrid({ resources, isLoading, hasFilters, onTagClick }: ResourceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-[--color-pill-bg]" />
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="mb-4 text-4xl">{hasFilters ? "🔍" : "📚"}</span>
        <h3 className="text-lg font-medium text-[--color-text-primary]">
          {hasFilters ? "No results found" : "No resources yet"}
        </h3>
        <p className="mt-1 max-w-xs text-sm text-[--color-text-tertiary]">
          {hasFilters
            ? "Try a different search term or clear filters"
            : "Paste a URL in the bar above to save your first resource"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} onTagClick={onTagClick} />
      ))}
    </div>
  );
}
