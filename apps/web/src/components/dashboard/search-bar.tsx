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
