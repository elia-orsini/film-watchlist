'use client';

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, onClear, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (value.trim()) {
      onSearch(value);
    } else {
      // Clear results if query is empty
      if (onClear) {
        onClear();
      } else {
        onSearch('');
      }
    }
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (!value.trim()) {
      // Clear results immediately when input is cleared
      debouncedSearch.cancel(); // Cancel any pending debounced calls
      if (onClear) {
        onClear();
      } else {
        onSearch('');
      }
    } else {
      debouncedSearch(value);
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search for movies..."
          className="w-full px-4 py-3 pl-12 pr-4 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

