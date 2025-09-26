/**
 * SSR utilities for Server Components
 * Provides prefetch functions that can be used with TanStack Query's prefetchQuery
 */

import { QueryClient } from '@tanstack/react-query';
import { strapiClient } from './client';
import { queryKeys } from './queries/keys';
import type { ArticleFilters } from './types';
import {
  bridgeArticleCollection,
  bridgeArticleSingle,
  bridgeCategoryCollection,
  bridgeCategorySingle,
  bridgeFooterSingle,
  safeCastParams,
} from './types';

// Article prefetch functions for SSR
export const prefetchArticles = (
  queryClient: QueryClient,
  params?: {
    page?: number;
    pageSize?: number;
    filters?: ArticleFilters;
    sort?: string | string[];
    populate?: string | string[] | object;
  }
) => {
  return queryClient.prefetchQuery({
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
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchArticle = (queryClient: QueryClient, id: string) => {
  return queryClient.prefetchQuery({
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
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchArticleBySlug = (
  queryClient: QueryClient,
  slug: string
) => {
  return queryClient.prefetchQuery({
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
    staleTime: 5 * 60 * 1000,
  });
};

export const prefetchFeaturedArticles = (
  queryClient: QueryClient,
  limit = 6
) => {
  return queryClient.prefetchQuery({
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
    staleTime: 10 * 60 * 1000,
  });
};

// Category prefetch functions for SSR
export const prefetchCategories = (queryClient: QueryClient) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      const response = await strapiClient.collection('categories').find(
        safeCastParams({
          sort: ['name:asc'],
          pagination: { pageSize: 100 },
        })
      );
      return bridgeCategoryCollection(response);
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const prefetchCategory = (queryClient: QueryClient, id: string) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.category(id),
    queryFn: async () => {
      const response = await strapiClient.collection('categories').findOne(id);
      return bridgeCategorySingle(response);
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const prefetchCategoryBySlug = (
  queryClient: QueryClient,
  slug: string
) => {
  return queryClient.prefetchQuery({
    queryKey: [...queryKeys.categories(), 'slug', slug],
    queryFn: async () => {
      const response = await strapiClient.collection('categories').find(
        safeCastParams({
          filters: { slug: { $eq: slug } },
        })
      );
      return bridgeCategoryCollection(response);
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Footer prefetch function for SSR
export const prefetchFooter = (queryClient: QueryClient) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.footer(),
    queryFn: async () => {
      const response = await strapiClient.single('footer').find(
        safeCastParams({
          populate: {
            logo: true,
            socialLinks: true,
            menuLinks: true,
          },
        })
      );
      return bridgeFooterSingle(response);
    },
    staleTime: 30 * 60 * 1000,
  });
};

// Helper to create a QueryClient for SSR
export const createSSRQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true,
        retry: (failureCount, error: unknown) => {
          const status = (error as { status?: number })?.status;
          if (typeof status === 'number' && status >= 400 && status < 500) {
            return false;
          }
          return failureCount < 3;
        },
      },
    },
  });
};
