import { type Article, strapiClient } from '@repo/strapi-client';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Full Search API - For dedicated search results page
 *
 * Supports:
 * - Pagination
 * - Filtering by category
 * - Sorting (date, title)
 * - Full text search in title and description
 *
 * @example
 * GET /api/search?q=nextjs&page=1&limit=12&category=web-dev&sort=date-desc
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const limit = Number.parseInt(searchParams.get('limit') || '12', 10);
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'date-desc';

  // Validate query
  if (!query || query.length < 3) {
    return NextResponse.json(
      {
        query,
        results: [],
        pagination: {
          page: 1,
          pageSize: limit,
          total: 0,
          pageCount: 0,
        },
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
    // Build search filters
    const filters: any = {
      $or: [
        { title: { $containsi: query } },
        { description: { $containsi: query } },
      ],
    };

    // Add category filter if provided
    if (category && category !== 'all') {
      filters.category = {
        slug: category,
      };
    }

    // Map sort options to Strapi sort format
    const sortMap: Record<string, string[]> = {
      'date-desc': ['publishedAt:desc'],
      'date-asc': ['publishedAt:asc'],
      'title-asc': ['title:asc'],
      'title-desc': ['title:desc'],
    };

    const sortOption = sortMap[sort] || sortMap['date-desc'];

    // Execute search
    const response = await strapiClient.collection('articles').find({
      filters,
      sort: sortOption,
      pagination: {
        page,
        pageSize: limit,
      },
      populate: {
        author: true,
        category: true,
        cover: true,
      },
    });

    const articles = (response?.data as unknown as Article[]) || [];
    const pagination = response?.meta?.pagination || {
      page: 1,
      pageSize: limit,
      total: 0,
      pageCount: 0,
    };

    return NextResponse.json(
      {
        query,
        results: articles,
        pagination,
        filters: {
          category: category || 'all',
          sort,
        },
      },
      {
        headers: {
          // Edge caching: 30s cache, 60s stale-while-revalidate
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('[Search] Error:', error);

    return NextResponse.json(
      {
        query,
        results: [],
        pagination: {
          page: 1,
          pageSize: limit,
          total: 0,
          pageCount: 0,
        },
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
