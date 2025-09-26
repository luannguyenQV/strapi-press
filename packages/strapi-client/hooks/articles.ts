/**
 * Article query hooks using TanStack Query + @strapi/client
 * Following TanStack Query best practices with proper caching and invalidation
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
  bridgeArticleSingle,
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

// Response interfaces imported from ../types

/**
 * Fetch all articles with pagination and filtering
 */
export const useArticles = (
  params?: ArticleQueryParams,
  options?: Omit<
    UseQueryOptions<StrapiResponse<Article>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...queryKeys.articles(), params],
    queryFn: async () => {
      const response = await strapiClient.collection('articles').find(
        safeCastParams({
          populate: {
            author: {
              populate: ['avatar'],
            },
            category: true,
            cover: true,
            seo: true,
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
    staleTime: 5 * 60 * 1000, // 5 minutes - matching your original cache TTL
    ...options,
  });
};

/**
 * Fetch single article by document ID
 */
export const useArticle = (
  id: string,
  options?: Omit<
    UseQueryOptions<StrapiSingleResponse<Article>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: queryKeys.article(id),
    queryFn: async () => {
      const response = await strapiClient.collection('articles').findOne(
        id,
        safeCastParams({
          populate: {
            author: {
              populate: ['avatar'],
            },
            category: true,
            cover: true,
            seo: true,
          },
        })
      );
      return bridgeArticleSingle(response);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Fetch article by slug
 */
export const useArticleBySlug = (
  slug: string,
  options?: Omit<
    UseQueryOptions<StrapiResponse<Article>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...queryKeys.articles(), 'slug', slug],
    queryFn: async () => {
      const response = await strapiClient.collection('articles').find(
        safeCastParams({
          filters: { slug: { $eq: slug } },
          populate: {
            author: {
              populate: ['avatar'],
            },
            category: true,
            cover: true,
            seo: true,
          },
        })
      );
      return bridgeArticleCollection(response);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Fetch featured articles
 */
export const useFeaturedArticles = (
  limit = 6,
  options?: Omit<
    UseQueryOptions<StrapiResponse<Article>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: [...queryKeys.articles(), 'featured', limit],
    queryFn: async () => {
      const response = await strapiClient.collection('articles').find(
        safeCastParams({
          filters: { featured: { $eq: true } },
          fields: ['title', 'description', 'slug', 'publishedAt'],
          populate: {
            author: {
              fields: ['name'],
            },
            category: {
              fields: ['name'],
            },
            cover: {
              fields: ['url', 'alternativeText', 'width', 'height'],
            },
          },
          sort: ['publishedAt:desc'],
          pagination: { pageSize: limit },
        })
      );
      return bridgeArticleCollection(response);
    },
    staleTime: 10 * 60 * 1000, // Featured articles can be cached longer
    ...options,
  });
};

/**
 * Fetch articles by category
 */
export const useArticlesByCategory = (
  categoryId: string,
  params?: ArticleQueryParams,
  options?: Omit<
    UseQueryOptions<StrapiResponse<Article>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: queryKeys.articlesByCategory(categoryId),
    queryFn: async () => {
      const response = await strapiClient.collection('articles').find(
        safeCastParams({
          filters: {
            category: { documentId: { $eq: categoryId } },
          },
          populate: {
            author: { populate: ['avatar'] },
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
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Search articles
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
            author: { populate: ['avatar'] },
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

// Mutations
/**
 * Create new article
 */
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Article>) => {
      const response = await strapiClient
        .collection('articles')
        .create(safeCastParams(data));
      return bridgeArticleSingle(response);
    },
    onSuccess: () => {
      // Invalidate articles list to show new article
      queryClient.invalidateQueries({ queryKey: queryKeys.articles() });
    },
  });
};

/**
 * Update existing article
 */
export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: { id: string; data: Partial<Article> }) => {
      const response = await strapiClient
        .collection('articles')
        .update(id, safeCastParams(data));
      return bridgeArticleSingle(response);
    },
    onSuccess: (updatedArticle, variables) => {
      // Update specific article cache
      queryClient.setQueryData(queryKeys.article(variables.id), {
        data: updatedArticle.data,
        meta: updatedArticle.meta,
      });

      // Invalidate articles list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.articles() });
    },
  });
};

/**
 * Delete article
 */
export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await strapiClient.collection('articles').delete(id);
      return bridgeArticleSingle(response);
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.article(deletedId) });

      // Invalidate articles list
      queryClient.invalidateQueries({ queryKey: queryKeys.articles() });
    },
  });
};

/**
 * Increment view count (optimistic update)
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
