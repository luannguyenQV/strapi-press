'use client';

import { Button } from '@repo/design-system/components/ui/button';
import type { Article, ArticleFilterQuery, StrapiResponse } from '@repo/strapi-client';
import { DEFAULT_PAGE_SIZE, useInfiniteArticles } from '@repo/strapi-client';
import type { InfiniteData } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ArticleListItem } from './list-item';
import { ArticleListItemsSkeleton } from './list-items.skeleton';

interface InfinityArticlesProps {
  /** Number of articles per page (should match server-side pageSize) */
  pageSize?: number;
  /** Sort order for publishedAt field */
  sortBy?: 'asc' | 'desc';
  /** Filter by author slug */
  authorSlug?: string;
  /** Filter by category slug */
  categorySlug?: string;
  /** Filter by featured status: true (only featured), false (only non-featured), undefined (all) */
  featured?: boolean;
  /** Search query for title (case-insensitive) */
  searchQuery?: string;
}

/**
 * LoadMoreArticles - Client Component for infinite scroll/load more
 *
 * Architecture:
 * - Fetches pages 2+ using TanStack Query with client-side caching
 * - Page 1 is server-rendered with ISR cache (handled by parent)
 * - Caches loaded pages in memory (5 min stale, 10 min GC)
 * - Smooth UX with loading states and error handling
 *
 * Usage:
 * - Server Component renders page 1 with Articles component
 * - Client Component (this) handles page 2+ with InfinityArticles
 */
export function InfinityArticles({
  pageSize = DEFAULT_PAGE_SIZE,
  sortBy = 'desc',
  authorSlug,
  categorySlug,
  featured,
  searchQuery,
}: InfinityArticlesProps) {
  // Build filters array for $and operator (same as server component)
  const filterConditions: ArticleFilterQuery[] = [];

  // Add search filter if provided
  if (searchQuery && searchQuery.trim().length > 0) {
    filterConditions.push({
      title: { $containsi: searchQuery.trim() }
    });
  }

  // Add featured filter if provided
  if (featured !== undefined) {
    if (featured === true) {
      // Only show featured articles
      filterConditions.push({
        featured: { $eq: true }
      });
    } else {
      // Only show non-featured articles (featured = false OR null)
      filterConditions.push({
        $or: [
          { featured: { $eq: false } },
          { featured: { $null: true } }
        ]
      });
    }
  }

  // Add author filter if provided
  if (authorSlug) {
    filterConditions.push({
      author: { slug: { $eq: authorSlug } }
    });
  }

  // Add category filter if provided
  if (categorySlug) {
    filterConditions.push({
      category: { slug: { $eq: categorySlug } }
    });
  }

  // Build final filter object
  const filters: ArticleFilterQuery = filterConditions.length > 0
    ? { $and: filterConditions }
    : {};

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteArticles({
    pageSize,
    filters,
    sort: [`publishedAt:${sortBy}`],
  });

  // Initial loading state (first render)
  if (isLoading) {
    // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
    return <ArticleListItemsSkeleton />
  }

  // Error state
  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground text-sm">
          {error instanceof Error
            ? error.message
            : 'Unable to load more articles. Please try again.'}
        </p>
      </div>
    );
  }

  // No data or no pages loaded
  if (!data?.pages || data.pages.length === 0) {
    return null;
  }

  // Type assertion for InfiniteData structure
  const infiniteData = data as InfiniteData<StrapiResponse<Article>>;

  return (
    <div className='py-8'>
      {/* Render all loaded pages */}
      <div className="space-y-8">
        {infiniteData.pages.map((page, pageIndex) =>
          page.data.map((article: Article) => (
            <ArticleListItem
              key={`${pageIndex}-${article.id}`}
              article={article}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="min-w-[200px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Articles'
            )}
          </Button>
        </div>
      )}

      {/* End of list message */}
      {!hasNextPage && infiniteData.pages.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            You've reached the end of the articles list
          </p>
        </div>
      )}
    </div>
  );
}
