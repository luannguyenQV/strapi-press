/**
 * TanStack Query hooks for Articles
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { strapiClient } from '../client';
import { queryKeys } from '../queries/keys';
import type {
  Article,
  ArticleFilterQuery,
  PopulateParams,
  StrapiResponse,
} from '../types';
import { bridgeCollectionResponse, safeCastParams } from '../types';

interface UseInfiniteArticlesParams {
  pageSize?: number;
  filters?: ArticleFilterQuery;
  sort?: string | string[];
  populate?: string | string[] | PopulateParams;
}

/**
 * Hook for infinite scrolling articles
 */
export const useInfiniteArticles = ({
  pageSize = 10,
  filters,
  sort = ['publishedAt:desc'],
  populate = {
    author: {
      populate: { avatar: true },
    },
    category: true,
    cover: true,
  },
}: UseInfiniteArticlesParams = {}) => {
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.articles(),
      'infinite',
      { pageSize, filters, sort },
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await strapiClient.collection('articles').find(
        safeCastParams({
          filters,
          sort,
          populate,
          pagination: {
            page: pageParam,
            pageSize,
          },
        })
      );
      return bridgeCollectionResponse<Article>(response);
    },
    getNextPageParam: (lastPage: StrapiResponse<Article>) => {
      const { page, pageCount } = lastPage.meta.pagination;
      return page < pageCount ? page + 1 : undefined;
    },
    initialPageParam: 2, // Start from page 2 since page 1 is server-rendered
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
