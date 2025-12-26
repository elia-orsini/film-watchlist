import { NextRequest, NextResponse } from 'next/server';
import { getMovieImages } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tmdbId = searchParams.get('tmdbId');

  if (!tmdbId) {
    return NextResponse.json({ error: 'tmdbId parameter is required' }, { status: 400 });
  }

  try {
    const images = await getMovieImages(parseInt(tmdbId));
    return NextResponse.json(images);
  } catch (error) {
    console.error('Get movie images error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get movie images' },
      { status: 500 }
    );
  }
}

