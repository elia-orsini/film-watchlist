'use client';

import Image from 'next/image';
import { getPosterUrl } from '@/lib/tmdb';

interface PosterCardProps {
  film: {
    tmdb_id: number;
    title: string;
    poster_path: string | null;
    watched: boolean;
  };
  onRemove?: () => void;
  onToggleWatched?: () => void;
}

export default function PosterCard({ film, onRemove, onToggleWatched }: PosterCardProps) {
  const posterUrl = getPosterUrl(film.poster_path, 'w185');

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  const handleToggleWatched = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWatched) {
      onToggleWatched();
    }
  };

  return (
    <li className="list-none m-0 p-0">
      <div className="group relative w-[125px] mx-auto">
        {posterUrl !== '/placeholder-poster.svg' ? (
          <Image
            src={posterUrl}
            alt={film.title}
            width={125}
            height={187}
            className={`block w-full h-auto rounded-sm shadow-sm ${film.watched ? 'opacity-60' : ''}`}
            loading="lazy"
            sizes="125px"
          />
        ) : (
          <div className={`w-[125px] h-[187px] bg-zinc-800 flex items-center justify-center rounded-sm ${film.watched ? 'opacity-60' : ''}`}>
            <svg className="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div
          className="absolute inset-0 rounded-sm"
          title={film.title}
        >
          <span className="sr-only">{film.title}</span>
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 rounded-sm pointer-events-none"></span>
          <span className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-sm">
            {onToggleWatched && (
              <button
                onClick={handleToggleWatched}
                className={`p-2 rounded-full transition-colors shadow-lg z-10 ${
                  film.watched
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-white/90 hover:bg-white text-[#0d0d0d]'
                }`}
                title={film.watched ? 'Mark as unwatched' : 'Mark as watched'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            )}
            {onRemove && (
              <button
                onClick={handleRemove}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg z-10"
                title="Remove from watchlist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        </div>
      </div>
    </li>
  );
}

