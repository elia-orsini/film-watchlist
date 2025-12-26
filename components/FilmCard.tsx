'use client';

import Image from 'next/image';
import { getPosterUrl } from '@/lib/tmdb';

interface FilmCardProps {
  film: {
    tmdb_id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string | null;
    vote_average: number;
  };
  isInWatchlist?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export default function FilmCard({ film, isInWatchlist, onAdd, onRemove, showRemove = false }: FilmCardProps) {
  const posterUrl = getPosterUrl(film.poster_path);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-zinc-200 dark:border-zinc-800">
      {/* Poster Image */}
      <div className="aspect-[2/3] relative overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900">
        {posterUrl !== '/placeholder-poster.svg' ? (
          <Image
            src={posterUrl}
            alt={film.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-600">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Rating Badge Overlay */}
        {film.vote_average > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-white">
              {film.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content Area - Flex column to push button to bottom */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title and Metadata */}
        <div className="mb-3">
          <h3 className="font-bold text-base mb-1.5 line-clamp-2 text-zinc-900 dark:text-zinc-50 leading-tight">
            {film.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            {film.release_date && (
              <span className="font-medium">
                {new Date(film.release_date).getFullYear()}
              </span>
            )}
          </div>
        </div>

        {/* Description - Fixed height area */}
        <div className="flex-1 min-h-[60px] mb-4">
          {film.overview ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
              {film.overview}
            </p>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-600 italic">
              No description available
            </p>
          )}
        </div>

        {/* Button - Always at bottom */}
        <div className="mt-auto pt-2">
          {showRemove ? (
            <button
              onClick={onRemove}
              className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
            >
              Remove from Watchlist
            </button>
          ) : (
            <button
              onClick={onAdd}
              disabled={isInWatchlist}
              className={`w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm ${
                isInWatchlist
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white hover:shadow-md'
              }`}
            >
              {isInWatchlist ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  In Watchlist
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to Watchlist
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

