/**
 * Example: Build-Time Caching for Static Content
 *
 * This example shows how to cache data forever (only fetch at build time)
 * for content that rarely changes like categories, site settings, footer, etc.
 */

import { cachedFind, cachedFindSingleType } from '@repo/strapi-client';
import type { Category } from '@repo/strapi-client/types';

/**
 * Example 1: Categories with Build-Time Only Caching
 *
 * Categories are typically stable taxonomy that doesn't change frequently.
 * Using revalidate: false means:
 * - Data is fetched ONLY during build time (next build)
 * - Never refetched during runtime
 * - Requires rebuild to update
 *
 * Perfect for free-tier Strapi deployments with rate limits!
 */
export async function CategoriesWithBuildTimeCache() {
  const response = await cachedFind(
    'categories',
    {
      sort: ['name:asc'],
      pagination: { pageSize: 100 },
    },
    {
      revalidate: false, // ✅ Cache forever - only fetch at build time
      tags: ['categories', 'build-time-static'],
    }
  );

  const categories = (response?.data as unknown as Category[]) || [];

  return (
    <div>
      <h2>Categories (Build-Time Cached)</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <a href={`/category/${category.slug}`}>{category.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 2: Site Footer with Build-Time Only Caching
 *
 * Footer content rarely changes and is perfect for build-time caching.
 * This reduces API calls to zero for footer data.
 */
export async function FooterWithBuildTimeCache() {
  const response = await cachedFindSingleType(
    'footer',
    {
      populate: {
        logo: true,
        socialLinks: true,
        menuLinks: true,
      },
    },
    {
      revalidate: false, // ✅ Cache forever
      tags: ['footer', 'global-settings'],
    }
  );

  const footer = response?.data;

  if (!footer) return null;

  return (
    <footer>
      <div>
        {/* Footer content */}
        <p>© {new Date().getFullYear()} - Cached at build time</p>
      </div>
    </footer>
  );
}

/**
 * Example 3: Mixed Strategy - Some Build-Time, Some ISR
 *
 * Combine different caching strategies based on update frequency:
 * - Categories: Build-time only (rarely change)
 * - Articles: ISR with 5-minute revalidation (frequently updated)
 */
export async function HomePage() {
  // Categories: Cached forever at build time
  const categoriesResponse = await cachedFind(
    'categories',
    {
      sort: ['name:asc'],
    },
    {
      revalidate: false, // Build-time only
      tags: ['categories'],
    }
  );

  // Articles: ISR with 5-minute revalidation
  const articlesResponse = await cachedFind(
    'articles',
    {
      sort: ['publishedAt:desc'],
      pagination: { pageSize: 10 },
    },
    {
      revalidate: 300, // 5 minutes
      tags: ['articles', 'homepage'],
    }
  );

  const categories = (categoriesResponse?.data as unknown as Category[]) || [];
  const articles = articlesResponse?.data || [];

  return (
    <div>
      {/* Sidebar with categories (build-time cached) */}
      <aside>
        <h3>Categories (Static)</h3>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id}>{cat.name}</li>
          ))}
        </ul>
      </aside>

      {/* Main content with articles (ISR cached) */}
      <main>
        <h1>Latest Articles (ISR - 5 min)</h1>
        {/* Articles list */}
      </main>
    </div>
  );
}

/**
 * Example 4: Very Long Cache (Alternative to Build-Time)
 *
 * If you want to allow updates without rebuilds but still minimize API calls,
 * use a very long revalidation period like 1 day.
 */
export async function CategoriesWithDayCache() {
  const response = await cachedFind(
    'categories',
    {
      sort: ['name:asc'],
    },
    {
      revalidate: 60 * 60 * 24, // 1 day (86400 seconds)
      tags: ['categories'],
    }
  );

  const categories = (response?.data as unknown as Category[]) || [];

  return (
    <div>
      <h2>Categories (1 Day Cache)</h2>
      <p>Updates once per day automatically</p>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 5: On-Demand Revalidation (Webhook Integration)
 *
 * Even with revalidate: false, you can force updates using revalidateTag
 * in an API route triggered by Strapi webhooks.
 *
 * Note: This only works with ISR (revalidate: number), NOT with revalidate: false
 */

// File: app/api/revalidate/route.ts
/*
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Verify webhook secret
  if (body.secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    // Revalidate specific content type
    if (body.model === 'category') {
      revalidateTag('categories');
    }

    if (body.model === 'article') {
      revalidateTag('articles');
      revalidateTag(`article-${body.entry.slug}`);
    }

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
*/

/**
 * Usage Summary:
 *
 * 1. Build-Time Only (revalidate: false):
 *    - Best for: Footer, navigation, categories, authors
 *    - Pros: Zero API calls after build, perfect for free tier
 *    - Cons: Requires rebuild to update
 *
 * 2. Very Long Cache (revalidate: 86400):
 *    - Best for: Semi-static content that changes occasionally
 *    - Pros: Updates automatically once per day, no rebuild needed
 *    - Cons: Still makes API calls (once per day)
 *
 * 3. ISR with Webhooks:
 *    - Best for: Content that needs immediate updates
 *    - Pros: Instant updates via webhooks
 *    - Cons: More complex setup, more API calls
 *
 * Recommendation for Free Tier Strapi:
 * - Use revalidate: false for all taxonomy/config (categories, footer, etc.)
 * - Use revalidate: 300-600 for articles (5-10 minutes)
 * - This minimizes API calls while keeping content fresh
 */
