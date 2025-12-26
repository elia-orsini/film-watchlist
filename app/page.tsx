"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResultItem from "@/components/SearchResultItem";
import PosterCard from "@/components/PosterCard";
import PosterSelectorModal from "@/components/PosterSelectorModal";
import ConfirmModal from "@/components/ConfirmModal";
import PasswordModal from "@/components/PasswordModal";
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
  const [posterSelectorOpen, setPosterSelectorOpen] = useState<{
    tmdbId: number;
    title: string;
    currentPosterPath: string | null;
  } | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState<{
    tmdbId: number;
    title: string;
  } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Load watchlist on mount and check edit mode from localStorage
  useEffect(() => {
    loadWatchlist();
    // Check if edit mode is stored in localStorage
    const storedEditMode = localStorage.getItem("editModeUnlocked");
    if (storedEditMode === "true") {
      setIsEditMode(true);
    }
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
    // Note: Adding to watchlist is always allowed, regardless of edit mode
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

  const handleRemoveFromWatchlist = (film: WatchlistFilm) => {
    if (!isEditMode) return;
    setRemoveConfirmOpen({
      tmdbId: film.tmdb_id,
      title: film.title,
    });
  };

  const confirmRemoveFromWatchlist = async () => {
    if (!removeConfirmOpen) return;

    const { tmdbId } = removeConfirmOpen;
    try {
      const response = await fetch(`/api/watchlist?tmdbId=${tmdbId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadWatchlist();
      }
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    } finally {
      setRemoveConfirmOpen(null);
    }
  };

  const handleToggleWatched = async (tmdbId: number) => {
    if (!isEditMode) return;
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

  const handleChangePoster = (film: WatchlistFilm) => {
    if (!isEditMode) return;
    setPosterSelectorOpen({
      tmdbId: film.tmdb_id,
      title: film.title,
      currentPosterPath: film.poster_path,
    });
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsEditMode(true);
        localStorage.setItem("editModeUnlocked", "true");
        setPasswordModalOpen(false);
        setPasswordError("");
      } else {
        setPasswordError(data.error || "Incorrect password");
      }
    } catch (error) {
      console.error("Failed to verify password:", error);
      setPasswordError("Failed to verify password");
    }
  };

  const handleLock = () => {
    setIsEditMode(false);
    localStorage.removeItem("editModeUnlocked");
  };

  const handleSelectPoster = async (posterPath: string) => {
    if (!posterSelectorOpen) return;

    const tmdbId = posterSelectorOpen.tmdbId;

    // Optimistic update - immediately update UI
    setWatchlist((prev) =>
      prev.map((film) =>
        film.tmdb_id === tmdbId ? { ...film, poster_path: posterPath } : film
      )
    );

    try {
      const response = await fetch("/api/watchlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, posterPath }),
      });

      if (!response.ok) {
        // Reload watchlist to revert optimistic update on error
        await loadWatchlist();
        console.error("Failed to update poster");
      }
    } catch (error) {
      console.error("Failed to update poster:", error);
      // Reload watchlist to revert optimistic update on error
      await loadWatchlist();
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-100">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-zinc-800 items-center justify-between">
          <div className="flex gap-4">
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
              Watchlist
            </button>
          </div>
          <button
            onClick={isEditMode ? handleLock : () => setPasswordModalOpen(true)}
            className={`p-2 rounded-md transition-colors flex items-center justify-center ${
              isEditMode
                ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                : "bg-zinc-900 hover:bg-zinc-800 text-white"
            }`}
            title={isEditMode ? "Lock edit mode" : "Unlock edit mode"}
          >
            {isEditMode ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm ml-1">unlocked</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-sm ml-1">locked</span>
              </>
            )}
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
                    onAdd={
                      isEditMode ? () => handleAddToWatchlist(film) : undefined
                    }
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
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 list-none p-0 m-0">
                    {watchlist.map((film) => (
                      <PosterCard
                        key={film.id}
                        film={film}
                        isEditMode={isEditMode}
                        onRemove={
                          isEditMode
                            ? () => handleRemoveFromWatchlist(film)
                            : undefined
                        }
                        onToggleWatched={
                          isEditMode
                            ? () => handleToggleWatched(film.tmdb_id)
                            : undefined
                        }
                        onChangePoster={
                          isEditMode
                            ? () => handleChangePoster(film)
                            : undefined
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

      {/* Poster Selector Modal */}
      {posterSelectorOpen && (
        <PosterSelectorModal
          isOpen={true}
          onClose={() => setPosterSelectorOpen(null)}
          tmdbId={posterSelectorOpen.tmdbId}
          title={posterSelectorOpen.title}
          currentPosterPath={posterSelectorOpen.currentPosterPath}
          onSelectPoster={handleSelectPoster}
        />
      )}

      {/* Remove Confirmation Modal */}
      {removeConfirmOpen && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setRemoveConfirmOpen(null)}
          onConfirm={confirmRemoveFromWatchlist}
          title="Remove from Watchlist"
          message={`Are you sure you want to remove "${removeConfirmOpen.title}" from your watchlist?`}
          confirmText="Remove"
          cancelText="Cancel"
        />
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setPasswordError("");
        }}
        onConfirm={handlePasswordSubmit}
        error={passwordError}
      />
    </div>
  );
}
