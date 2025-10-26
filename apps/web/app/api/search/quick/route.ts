import { type Article, strapiClient } from '@repo/strapi-client';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Quick Search API - Optimized for header search dropdown
 *
 * Returns top 5 results for instant display
 * Searches in article title and description
 * Cached at edge for 30 seconds
 *
 * @example
 * GET /api/search/quick?q=nextjs&limit=5
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = Number.parseInt(searchParams.get('limit') || '5', 10);

  // Validate query
  if (!query || query.length < 3) {
    return NextResponse.json(
      {
        query,
        results: [],
        totalCount: 0,
        message: 'Query must be at least 3 characters',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  }

  try {
    // Search Strapi articles with case-insensitive contains
    const response = await strapiClient.collection('articles').find({
      filters: {
        $or: [
          { title: { $containsi: query } },
          { description: { $containsi: query } },
        ],
      },
      sort: ['publishedAt:desc'],
      pagination: {
        pageSize: limit,
        page: 1,
      },
      populate: {
        author: true,
        category: true,
        cover: true,
      },
    });

    const articles = (response?.data as unknown as Article[]) || [];
    const totalCount = response?.meta?.pagination?.total || 0;

    return NextResponse.json(
      {
        query,
        results: articles,
        totalCount,
        executionTime: `${Date.now()}ms`,
      },
      {
        headers: {
          // Edge caching: 30s cache, 60s stale-while-revalidate
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('[Search Quick] Error:', error);

    return NextResponse.json(
      {
        query,
        results: [],
        totalCount: 0,
        error: 'Search temporarily unavailable',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

// Enable edge runtime for faster responses
export const runtime = 'edge';
