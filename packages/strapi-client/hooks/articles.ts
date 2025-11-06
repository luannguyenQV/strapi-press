/**
 * Article query hooks using TanStack Query + @strapi/client
 * Only interactive features use TanStack Query - static content uses Next.js ISR
 *
 * For static content (articles, categories), use Server Components with cachedFind instead.
 * See docs/data-flow.md for architecture details.
 */

import {
  type InfiniteData,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { strapiClient } from '../client';
import { DEFAULT_PAGE_SIZE } from '../constant';
import { queryKeys } from '../queries/keys';
import type {
  Article,
  ArticleFilterQuery,
  StrapiResponse,
  StrapiSingleResponse,
} from '../types';
import { bridgeArticleCollection, safeCastParams } from '../types';

// Types for query parameters
export interface ArticleQueryParams {
  page?: number;
  pageSize?: number;
  filters?: ArticleFilterQuery;
  sort?: string | string[];
  populate?: string | string[] | object;
}

/**
 * Search articles (Client-side interactive feature)
 * Use this for real-time search with user input
 */
export const useSearchArticles = (
  query: string,
  params?: ArticleQueryParams,
  options?: Omit<
    UseQueryOptions<StrapiResponse<Article>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...queryKeys.articles(), 'search', query, params],
    queryFn: async () => {
      const response = await strapiClient.collection('articles').find(
        safeCastParams({
          filters: {
            $or: [
              { title: { $containsi: query } },
              { description: { $containsi: query } },
              { content: { $containsi: query } },
            ],
          },
          populate: {
            author: { populate: 'avatar' },
            category: true,
            cover: true,
          },
          sort: ['publishedAt:desc'],
          pagination: {
            page: params?.page || 1,
            pageSize: params?.pageSize || DEFAULT_PAGE_SIZE,
          },
          ...params,
        })
      );
      return bridgeArticleCollection(response);
    },
    enabled: !!query && query.length > 2, // Only search if query is meaningful
    staleTime: 2 * 60 * 1000, // Search results stale faster
    ...options,
  });
};

/**
 * Infinite scroll/load more for articles (Client-side interactive feature)
 * Use this for pagination after initial server-rendered page
 *
 * Architecture:
 * - Page 1: Server Component with ISR cache (fast initial load)
 * - Page 2+: Client Component with this hook (smooth UX)
 *
 * @param params - Query parameters (filters, sort, populate)
 * @param options - TanStack Query options
 * @returns Infinite query result with pages, fetchNextPage, hasNextPage
 */
export const useInfiniteArticles = (
  params?: Omit<ArticleQueryParams, 'page'>,
  options?: Partial<
    UseInfiniteQueryOptions<
      StrapiResponse<Article>,
      Error,
      InfiniteData<StrapiResponse<Article>>,
      unknown[],
      number
    >
  >
) => {
  return useInfiniteQuery<
    StrapiResponse<Article>,
    Error,
    InfiniteData<StrapiResponse<Article>>,
    unknown[],
    number
  >({
    queryKey: [
      ...queryKeys.articles(),
      'infinite',
      JSON.stringify(params),
    ] as const,
    queryFn: async (context) => {
      // Extract pageSize from params to avoid duplication
      const { pageSize, filters, sort, populate, ...restParams } = params || {};

      const response = await strapiClient.collection('articles').find(
        safeCastParams({
          populate: populate || {
            author: { populate: 'avatar' },
            category: true,
            cover: true,
          },
          sort: sort || ['publishedAt:desc'],
          pagination: {
            page: context.pageParam as number,
            pageSize: pageSize || 6,
          },
          filters,
          ...restParams,
        })
      );
      return bridgeArticleCollection(response);
    },
    initialPageParam: 2, // Start from page 2 (page 1 is server-rendered)
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = lastPage.meta?.pagination?.pageCount || 0;
      const currentPage = allPages.length + 1; // +1 because page 1 is server-rendered
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    // Caching strategy to match server-side ISR
    staleTime: 5 * 60 * 1000, // 5 min - match server cache duration
    gcTime: 10 * 60 * 1000, // 10 min - keep in memory longer
    refetchOnMount: false, // Don't refetch on component remount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    ...options,
  });
};

/**
 * Increment view count (Client-side interactive feature)
 * Uses optimistic updates for instant UI feedback
 */
export const useIncrementViewCount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      currentCount,
    }: { id: string; currentCount: number }) => {
      // In a real implementation, you might have a dedicated endpoint for this
      const response = await strapiClient.collection('articles').update(id, {
        viewCount: currentCount + 1,
      });
      return response as unknown as StrapiSingleResponse<Article>;
    },
    onMutate: async ({ id, currentCount }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.article(id) });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<
        StrapiSingleResponse<Article>
      >(queryKeys.article(id));

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData(queryKeys.article(id), {
          ...previousData,
          data: {
            ...previousData.data,
            viewCount: currentCount + 1,
          },
        });
      }

      return { previousData };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.article(id), context.previousData);
      }
    },
    onSettled: (_, __, { id }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.article(id) });
    },
  });
};
