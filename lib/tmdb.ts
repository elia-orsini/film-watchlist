const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  backdrop_path: string | null;
  imdb_id?: string | null;
}

export interface TMDBCredits {
  crew: Array<{
    id: number;
    name: string;
    job: string;
  }>;
}

export interface TMDBMovieWithDirector extends TMDBMovie {
  director?: string;
  imdb_id?: string | null;
}

export interface TMDBSearchResponse {
  results: TMDBMovie[];
  total_results: number;
  total_pages: number;
  page: number;
}

export async function searchMovies(
  query: string,
  page: number = 1
): Promise<TMDBSearchResponse> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}&page=${page}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovie> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getMovieCredits(movieId: number): Promise<TMDBCredits> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

export function getPosterUrl(
  posterPath: string | null,
  size: "w185" | "w342" | "w500" | "original" = "w500"
): string {
  if (!posterPath) {
    return "/placeholder-poster.svg";
  }
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

export interface TMDBImages {
  backdrops: Array<{
    file_path: string;
    width: number;
    height: number;
    iso_639_1: string | null;
    aspect_ratio: number;
    vote_average: number;
    vote_count: number;
  }>;
  posters: Array<{
    file_path: string;
    width: number;
    height: number;
    iso_639_1: string | null;
    aspect_ratio: number;
    vote_average: number;
    vote_count: number;
  }>;
}

export async function getMovieImages(movieId: number): Promise<TMDBImages> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/images?api_key=${TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }

  return response.json();
}

export function getLetterboxdUrl(title: string, year?: number | null): string {
  // Convert title to Letterboxd slug format
  // Letterboxd slugs are lowercase, with special characters removed and spaces as hyphens
  // Note: Letterboxd URLs work both with and without year, but the format without year is more common
  const slug = title
    .toLowerCase()
    // Remove common special characters but keep some
    .replace(/[^\w\s-]/g, "")
    // Replace spaces and multiple hyphens with single hyphen
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "");

  // Don't add year - Letterboxd URLs work without it (e.g., /film/surfs-up/ instead of /film/surfs-up-2007/)
  return `https://letterboxd.com/film/${slug}/`;
}
