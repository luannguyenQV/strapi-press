'use client';

import { Button } from '@repo/design-system/components/ui/button';
import type { Article, StrapiResponse } from '@repo/strapi-client';
import { DEFAULT_PAGE_SIZE, useInfiniteArticles } from '@repo/strapi-client';
import type { InfiniteData } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ArticleListItem } from './list-item';
import { ArticleListItemsSkeleton } from './list-items.skeleton';

interface LoadMoreArticlesProps {
  /** Number of articles per page (should match server-side pageSize) */
  pageSize?: number;
  /** Optional filters to apply (e.g., category, featured) */
  filters?: Record<string, unknown>;
  /** Optional sort order */
  sort?: string | string[];
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
 * - Client Component (this) handles page 2+ with LoadMoreArticles
 */
export function LoadMoreArticles({
  pageSize = DEFAULT_PAGE_SIZE,
  filters,
  sort,
}: LoadMoreArticlesProps) {
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
    sort,
  });

  // Initial loading state (first render)
  if (isLoading) {
    return <ArticleListItemsSkeleton count={3} />;
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
