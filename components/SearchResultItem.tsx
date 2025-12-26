'use client';

import Image from 'next/image';
import { getPosterUrl, getLetterboxdUrl } from '@/lib/tmdb';

interface SearchResultItemProps {
  film: {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string | null;
    vote_average: number;
    director?: string;
    imdb_id?: string | null;
  };
  isInWatchlist?: boolean;
  isAdding?: boolean;
  onAdd?: () => void;
}

export default function SearchResultItem({ film, isInWatchlist, isAdding, onAdd }: SearchResultItemProps) {
  const posterUrl = getPosterUrl(film.poster_path, 'w185');
  const year = film.release_date ? new Date(film.release_date).getFullYear() : null;
  const letterboxdUrl = getLetterboxdUrl(film.title, year);

  return (
    <li className="flex gap-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
      {/* Poster */}
      <div className="flex-shrink-0">
        {posterUrl !== '/placeholder-poster.svg' ? (
          <Image
            src={posterUrl}
            alt={film.title}
            width={60}
            height={90}
            className="rounded-sm shadow-sm"
            loading="lazy"
            sizes="60px"
          />
        ) : (
          <div className="w-[60px] h-[90px] bg-zinc-800 flex items-center justify-center rounded-sm">
            <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-zinc-100 truncate">
              {film.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-zinc-400 mt-0.5">
              {film.director && (
                <>
                  <span className="truncate">{film.director}</span>
                  {year && <span>•</span>}
                </>
              )}
              {year && <span>{year}</span>}
            </div>
          </div>
          {film.vote_average > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-zinc-300">
                {film.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {film.overview && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
            {film.overview}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onAdd && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAdd();
              }}
              disabled={isInWatchlist || isAdding}
              className={`px-3 py-1.5 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5 ${
                isInWatchlist
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : isAdding
                  ? 'bg-zinc-700 text-white cursor-wait'
                  : 'bg-white text-[#0d0d0d] hover:bg-zinc-200'
              }`}
            >
              {isAdding ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : isInWatchlist ? (
                'In Watchlist'
              ) : (
                'Add to Watchlist'
              )}
            </button>
          )}
          <a
            href={letterboxdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5"
          >
            <span>Letterboxd</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </li>
  );
}

