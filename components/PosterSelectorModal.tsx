'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPosterUrl } from '@/lib/tmdb';

interface Poster {
  file_path: string;
  width: number;
  height: number;
}

interface PosterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tmdbId: number;
  title: string;
  currentPosterPath: string | null;
  onSelectPoster: (posterPath: string) => void;
}

export default function PosterSelectorModal({
  isOpen,
  onClose,
  tmdbId,
  title,
  currentPosterPath,
  onSelectPoster,
}: PosterSelectorModalProps) {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tmdbId) {
      loadPosters();
    } else {
      // Reset state when modal closes
      setPosters([]);
      setError(null);
    }
  }, [isOpen, tmdbId]);

  const loadPosters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/movie-images?tmdbId=${tmdbId}`);
      if (response.ok) {
        const data = await response.json();
        setPosters(data.posters || []);
      } else {
        setError('Failed to load posters');
      }
    } catch (err) {
      setError('Failed to load posters');
      console.error('Error loading posters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPoster = (posterPath: string) => {
    onSelectPoster(posterPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">
            Select Poster for {title}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          ) : posters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400">No alternative posters found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {posters.map((poster, index) => {
                const posterUrl = getPosterUrl(poster.file_path, 'w342');
                const isCurrentPoster = poster.file_path === currentPosterPath;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectPoster(poster.file_path)}
                    className={`relative aspect-[2/3] rounded-sm overflow-hidden border-2 transition-all hover:scale-105 ${
                      isCurrentPoster
                        ? 'border-white ring-2 ring-white'
                        : 'border-zinc-700 hover:border-white'
                    }`}
                  >
                    <Image
                      src={posterUrl}
                      alt={`Poster ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                    {isCurrentPoster && (
                      <div className="absolute top-2 left-2 bg-white text-[#0d0d0d] px-2 py-1 rounded text-xs font-medium">
                        Current
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

