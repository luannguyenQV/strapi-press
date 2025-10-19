import { revalidatePath, revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * On-demand revalidation API route for Next.js ISR
 *
 * This endpoint allows Strapi webhooks to trigger cache invalidation when content changes.
 *
 * Usage:
 * POST /api/revalidate
 * Body: {
 *   secret: "YOUR_REVALIDATION_SECRET",
 *   tags: ["articles", "categories"], // Optional: array of cache tags to revalidate
 *   paths: ["/", "/blog"], // Optional: array of paths to revalidate
 * }
 *
 * Environment variables:
 * - REVALIDATION_SECRET: Secret token for authentication (required)
 *
 * Example Strapi webhook configuration:
 * URL: https://your-domain.com/api/revalidate
 * Headers: Content-Type: application/json
 * Body:
 * {
 *   "secret": "YOUR_REVALIDATION_SECRET",
 *   "tags": ["articles"]
 * }
 */

interface RevalidationRequest {
  secret?: string;
  tags?: string[];
  paths?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as RevalidationRequest;
    const { secret, tags, paths } = body;

    // Validate secret token
    if (!secret || secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { message: 'Invalid or missing secret token' },
        { status: 401 }
      );
    }

    // Validate that at least one revalidation target is provided
    if ((!tags || tags.length === 0) && (!paths || paths.length === 0)) {
      return NextResponse.json(
        { message: 'Either tags or paths must be provided' },
        { status: 400 }
      );
    }

    // Revalidate by tags
    const revalidatedTags: string[] = [];
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        revalidateTag(tag);
        revalidatedTags.push(tag);
      }
    }

    // Revalidate by paths
    const revalidatedPaths: string[] = [];
    if (paths && paths.length > 0) {
      for (const path of paths) {
        revalidatePath(path);
        revalidatedPaths.push(path);
      }
    }

    // Log revalidation in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Revalidation] Successfully revalidated:', {
        tags: revalidatedTags,
        paths: revalidatedPaths,
      });
    }

    return NextResponse.json(
      {
        revalidated: true,
        tags: revalidatedTags,
        paths: revalidatedPaths,
        now: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Revalidation] Error:', error);
    return NextResponse.json(
      {
        message: 'Error revalidating',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET method for testing (development only)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { message: 'GET method only available in development' },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const tag = searchParams.get('tag');
  const path = searchParams.get('path');

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { message: 'Invalid or missing secret token' },
      { status: 401 }
    );
  }

  if (!tag && !path) {
    return NextResponse.json(
      { message: 'Either tag or path query parameter must be provided' },
      { status: 400 }
    );
  }

  try {
    if (tag) {
      revalidateTag(tag);
      console.log(`[Revalidation] Revalidated tag: ${tag}`);
      return NextResponse.json({ revalidated: true, tag, now: Date.now() });
    }

    if (path) {
      revalidatePath(path);
      console.log(`[Revalidation] Revalidated path: ${path}`);
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    return NextResponse.json({ message: 'No action taken' }, { status: 400 });
  } catch (error) {
    console.error('[Revalidation] Error:', error);
    return NextResponse.json(
      {
        message: 'Error revalidating',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
