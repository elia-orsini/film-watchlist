import { NextRequest, NextResponse } from 'next/server';
import { getWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleWatched } from '@/lib/db';
import { getMovieDetails } from '@/lib/tmdb';

export async function GET() {
  try {
    const films = await getWatchlist();
    return NextResponse.json(films);
  } catch (error) {
    console.error('Get watchlist error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get watchlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tmdbId } = await request.json();

    if (!tmdbId) {
      return NextResponse.json({ error: 'tmdbId is required' }, { status: 400 });
    }

    // Check if already in watchlist
    const exists = await isInWatchlist(tmdbId);
    if (exists) {
      return NextResponse.json({ message: 'Film already in watchlist' }, { status: 200 });
    }

    // Fetch movie details from TMDB
    const movie = await getMovieDetails(tmdbId);

    // Add to watchlist
    await addToWatchlist({
      tmdb_id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
    });

    return NextResponse.json({ message: 'Film added to watchlist' }, { status: 201 });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add to watchlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tmdbId = searchParams.get('tmdbId');

    if (!tmdbId) {
      return NextResponse.json({ error: 'tmdbId is required' }, { status: 400 });
    }

    await removeFromWatchlist(parseInt(tmdbId));
    return NextResponse.json({ message: 'Film removed from watchlist' }, { status: 200 });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { tmdbId } = await request.json();

    if (!tmdbId) {
      return NextResponse.json({ error: 'tmdbId is required' }, { status: 400 });
    }

    // Check if film exists in watchlist
    const exists = await isInWatchlist(tmdbId);
    if (!exists) {
      return NextResponse.json({ error: 'Film not found in watchlist' }, { status: 404 });
    }

    // Toggle watched status
    await toggleWatched(tmdbId);

    return NextResponse.json({ message: 'Watched status updated' }, { status: 200 });
  } catch (error) {
    console.error('Update watched status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update watched status' },
      { status: 500 }
    );
  }
}

