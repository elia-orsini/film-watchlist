"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResultItem from "@/components/SearchResultItem";
import PosterCard from "@/components/PosterCard";
import { TMDBMovieWithDirector } from "@/lib/tmdb";

interface WatchlistFilm {
  id: number;
  tmdb_id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number;
  watched: boolean;
  added_at: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovieWithDirector[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistFilm[]>([]);
  const [activeTab, setActiveTab] = useState<"search" | "watchlist">("search");
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [optimisticWatchlist, setOptimisticWatchlist] = useState<Set<number>>(
    new Set()
  );
  const [addingFilms, setAddingFilms] = useState<Set<number>>(new Set());

  // Load watchlist on mount
  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setIsLoadingWatchlist(true);
      const response = await fetch("/api/watchlist");
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
        // Clear optimistic updates for films that are now in the actual watchlist
        setOptimisticWatchlist((prev) => {
          const next = new Set(prev);
          data.forEach((film: WatchlistFilm) => {
            next.delete(film.tmdb_id);
          });
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to load watchlist:", error);
    } finally {
      setIsLoadingWatchlist(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery("");
      return;
    }

    setSearchQuery(query);
    try {
      setIsSearching(true);
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToWatchlist = async (film: TMDBMovieWithDirector) => {
    // Optimistic update - immediately update UI
    setOptimisticWatchlist((prev) => new Set(prev).add(film.id));
    setAddingFilms((prev) => new Set(prev).add(film.id));

    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId: film.id }),
      });

      if (response.ok) {
        // Reload watchlist to get the actual data
        await loadWatchlist();
      } else {
        // Revert optimistic update on error
        setOptimisticWatchlist((prev) => {
          const next = new Set(prev);
          next.delete(film.id);
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      // Revert optimistic update on error
      setOptimisticWatchlist((prev) => {
        const next = new Set(prev);
        next.delete(film.id);
        return next;
      });
    } finally {
      setAddingFilms((prev) => {
        const next = new Set(prev);
        next.delete(film.id);
        return next;
      });
    }
  };

  const handleRemoveFromWatchlist = async (tmdbId: number) => {
    try {
      const response = await fetch(`/api/watchlist?tmdbId=${tmdbId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadWatchlist();
      }
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    }
  };

  const handleToggleWatched = async (tmdbId: number) => {
    // Optimistic update - immediately update UI
    setWatchlist((prev) =>
      prev.map((film) =>
        film.tmdb_id === tmdbId ? { ...film, watched: !film.watched } : film
      )
    );

    try {
      const response = await fetch("/api/watchlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId }),
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setWatchlist((prev) =>
          prev.map((film) =>
            film.tmdb_id === tmdbId ? { ...film, watched: !film.watched } : film
          )
        );
        console.error("Failed to toggle watched status");
      }
    } catch (error) {
      console.error("Failed to toggle watched status:", error);
      // Revert optimistic update on error
      setWatchlist((prev) =>
        prev.map((film) =>
          film.tmdb_id === tmdbId ? { ...film, watched: !film.watched } : film
        )
      );
    }
  };

  const isInWatchlist = (tmdbId: number) => {
    // Check both actual watchlist and optimistic updates
    return (
      watchlist.some((f) => f.tmdb_id === tmdbId) ||
      optimisticWatchlist.has(tmdbId)
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "search"
                ? "text-white border-b-2 border-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "watchlist"
                ? "text-white border-b-2 border-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Watchlist ({watchlist.length + optimisticWatchlist.size})
          </button>
        </div>

        {activeTab === "search" && (
          <div>
            <div className="mb-8 flex justify-center">
              <SearchBar
                onSearch={handleSearch}
                onClear={() => {
                  setSearchResults([]);
                  setSearchQuery("");
                }}
                isLoading={isSearching}
              />
            </div>

            {searchResults.length > 0 ? (
              <ul className="space-y-3">
                {searchResults.map((film) => (
                  <SearchResultItem
                    key={film.id}
                    film={film}
                    isInWatchlist={isInWatchlist(film.id)}
                    isAdding={addingFilms.has(film.id)}
                    onAdd={() => handleAddToWatchlist(film)}
                  />
                ))}
              </ul>
            ) : searchQuery ? (
              <div className="text-center py-12">
                <p className="text-zinc-400">
                  {isSearching ? "Searching..." : "No results found"}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-zinc-400">
                  Start typing to search for movies
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "watchlist" && (
          <div>
            {isLoadingWatchlist ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : watchlist.length > 0 ? (
              <>
                <div>
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(125px,1fr))] gap-4 sm:gap-5 list-none p-0 m-0">
                    {watchlist.map((film) => (
                      <PosterCard
                        key={film.id}
                        film={film}
                        onRemove={() => handleRemoveFromWatchlist(film.tmdb_id)}
                        onToggleWatched={() =>
                          handleToggleWatched(film.tmdb_id)
                        }
                      />
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-zinc-400 mb-4">Your watchlist is empty</p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="px-6 py-2 bg-white text-[#0d0d0d] hover:bg-zinc-200 rounded-md transition-colors font-medium"
                >
                  Search for Movies
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
