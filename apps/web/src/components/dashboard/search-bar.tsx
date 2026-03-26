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
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">🔍</span>
      <input
        type="search"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-200 bg-transparent py-2 pl-9 pr-4 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-500 dark:border-neutral-700 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-500"
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            const input = document.querySelector('input[type="search"]') as HTMLInputElement;
            if (input) input.value = "";
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ×
        </button>
      )}
    </div>
  );
}
