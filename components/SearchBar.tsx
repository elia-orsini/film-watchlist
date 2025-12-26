"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
}

export default function SearchBar({
  onSearch,
  onClear,
  isLoading,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    } else {
      if (onClear) {
        onClear();
      } else {
        onSearch("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative flex">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for movies..."
          className="w-full px-4 py-3 pl-12 pr-24 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring focus:ring-zinc-600 focus:border-transparent"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium border border-zinc-700"
        >
          Search
        </button>
        {isLoading && (
          <div className="absolute right-24 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
