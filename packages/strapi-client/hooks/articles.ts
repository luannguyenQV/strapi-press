/**
 * Article query hooks using TanStack Query + @strapi/client
 * Only interactive features use TanStack Query - static content uses Next.js ISR
 *
 * For static content (articles, categories), use Server Components with cachedFind instead.
 * See docs/data-flow.md for architecture details.
 */

import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { strapiClient } from '../client';
import { queryKeys } from '../queries/keys';
import type {
  Article,
  ArticleFilters,
  StrapiResponse,
  StrapiSingleResponse,
} from '../types';
import {
  bridgeArticleCollection,
  safeCastParams,
} from '../types';

// Types for query parameters
export interface ArticleQueryParams {
  page?: number;
  pageSize?: number;
  filters?: ArticleFilters;
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
            pageSize: params?.pageSize || 10,
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
