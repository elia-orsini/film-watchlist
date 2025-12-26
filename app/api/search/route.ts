import { NextRequest, NextResponse } from 'next/server';
import { searchMovies, getMovieCredits, getMovieDetails } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const results = await searchMovies(query, page);
    
    // Fetch director and IMDB ID for first 10 results (to keep it fast)
    const resultsWithDirectors = await Promise.all(
      results.results.slice(0, 10).map(async (movie) => {
        try {
          // Fetch both credits and movie details in parallel
          const [credits, details] = await Promise.all([
            getMovieCredits(movie.id).catch(() => null),
            getMovieDetails(movie.id).catch(() => null)
          ]);
          
          const director = credits?.crew.find(person => person.job === 'Director')?.name;
          const imdb_id = details?.imdb_id || null;
          return { ...movie, director, imdb_id };
        } catch (error) {
          // If fetch fails, just return movie without director/imdb
          return movie;
        }
      })
    );

    // Combine with remaining results
    const allResults = [
      ...resultsWithDirectors,
      ...results.results.slice(10)
    ];

    return NextResponse.json({
      ...results,
      results: allResults
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search movies' },
      { status: 500 }
    );
  }
}

