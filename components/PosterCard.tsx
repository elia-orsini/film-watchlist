"use client";

import Image from "next/image";
import { getPosterUrl, getLetterboxdUrl } from "@/lib/tmdb";

interface PosterCardProps {
  film: {
    tmdb_id: number;
    title: string;
    poster_path: string | null;
    release_date: string | null;
    watched: boolean;
  };
  onRemove?: () => void;
  onToggleWatched?: () => void;
  onChangePoster?: () => void;
  isEditMode?: boolean;
}

export default function PosterCard({
  film,
  onRemove,
  onToggleWatched,
  onChangePoster,
  isEditMode = false,
}: PosterCardProps) {
  const posterUrl = getPosterUrl(film.poster_path, "w185");
  const year = film.release_date
    ? new Date(film.release_date).getFullYear()
    : null;
  const letterboxdUrl = getLetterboxdUrl(film.title, year);

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

  const handleChangePoster = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onChangePoster) {
      onChangePoster();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isEditMode) {
      // When locked, clicking the card opens letterboxd
      window.open(letterboxdUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <li className={`list-none m-0 p-0`}>
      <div
        onClick={!isEditMode ? handleCardClick : undefined}
        className={`group relative w-[140px] h-[210px] mx-auto rounded-sm border-[0.1rem] transition-colors duration-200 overflow-hidden ${
          film.watched ? "border-zinc-700" : "border-zinc-400"
        } hover:!border-blue-300 ${!isEditMode ? "cursor-pointer" : ""}`}
      >
        {posterUrl !== "/placeholder-poster.svg" ? (
          <Image
            src={posterUrl}
            alt={film.title}
            width={140}
            height={210}
            className={`w-full h-full object-cover ${
              film.watched ? "opacity-35" : ""
            }`}
            loading="lazy"
            sizes="140px"
          />
        ) : (
          <div
            className={`w-full h-full bg-zinc-800 flex items-center justify-center ${
              film.watched ? "opacity-35" : ""
            }`}
          >
            <svg
              className="w-12 h-12 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 rounded-sm" title={film.title}>
          <span className="sr-only">{film.title}</span>
          <span
            className={`absolute bottom-0 left-0 right-0 flex gap-1 p-1.5 justify-center transition-opacity duration-200 rounded-sm ${
              isEditMode ? "opacity-0 group-hover:opacity-100" : "opacity-0"
            }`}
          >
            {isEditMode && (
              <a
                href={letterboxdUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 bg-white hover:bg-zinc-100 rounded-md transition-colors shadow-lg z-10 flex items-center justify-center"
                title="View on Letterboxd"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 500 500"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <defs>
                    <rect
                      id="path-1"
                      x="0"
                      y="0"
                      width="129.847328"
                      height="141.389313"
                    ></rect>
                    <rect
                      id="path-3"
                      x="0"
                      y="0"
                      width="129.847328"
                      height="141.389313"
                    ></rect>
                  </defs>
                  <g
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <circle fill="#FFFFFF" cx="250" cy="250" r="250"></circle>
                    <g transform="translate(61.000000, 180.000000)">
                      <g>
                        <ellipse
                          fill="#00E054"
                          cx="189"
                          cy="69.9732824"
                          rx="70.0786517"
                          ry="69.9732824"
                        ></ellipse>
                        <g transform="translate(248.152672, 0.000000)">
                          <ellipse
                            fill="#40BCF4"
                            cx="59.7686766"
                            cy="69.9732824"
                            rx="70.0786517"
                            ry="69.9732824"
                          ></ellipse>
                        </g>
                        <g>
                          <ellipse
                            fill="#FF8000"
                            cx="70.0786517"
                            cy="69.9732824"
                            rx="70.0786517"
                            ry="69.9732824"
                          ></ellipse>
                        </g>
                        <path
                          d="M129.539326,107.022244 C122.810493,96.2781677 118.921348,83.5792213 118.921348,69.9732824 C118.921348,56.3673435 122.810493,43.6683972 129.539326,32.9243209 C136.268159,43.6683972 140.157303,56.3673435 140.157303,69.9732824 C140.157303,83.5792213 136.268159,96.2781677 129.539326,107.022244 Z"
                          fill="#556677"
                        ></path>
                        <path
                          d="M248.460674,32.9243209 C255.189507,43.6683972 259.078652,56.3673435 259.078652,69.9732824 C259.078652,83.5792213 255.189507,96.2781677 248.460674,107.022244 C241.731841,96.2781677 237.842697,83.5792213 237.842697,69.9732824 C237.842697,56.3673435 241.731841,43.6683972 248.460674,32.9243209 Z"
                          fill="#556677"
                        ></path>
                      </g>
                    </g>
                  </g>
                </svg>
              </a>
            )}
            {onChangePoster && (
              <button
                onClick={handleChangePoster}
                className="p-1.5 bg-blue-400 hover:bg-blue-500 text-white rounded-md transition-colors shadow-lg z-10 flex items-center justify-center"
                title="Change poster"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
            {onToggleWatched && (
              <button
                onClick={handleToggleWatched}
                className={`p-1.5 rounded-md transition-colors shadow-lg z-10 flex items-center justify-center ${
                  film.watched
                    ? "bg-zinc-700 hover:bg-zinc-800 text-white"
                    : "bg-white/90 hover:bg-white/80 text-[#0d0d0d]"
                }`}
                title={film.watched ? "Mark as unwatched" : "Mark as watched"}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            )}
            {onRemove && (
              <button
                onClick={handleRemove}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors shadow-lg z-10 flex items-center justify-center"
                title="Remove from watchlist"
              >
                <svg
                  className="w-3.5 h-3.5"
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
            )}
          </span>
        </div>
      </div>
    </li>
  );
}
