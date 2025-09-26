/**
 * Example usage of hook factory patterns
 * Shows how to create type-safe hooks with minimal boilerplate
 */

import { queryKeys } from '../queries/keys';
import type { Article, Category, Footer } from '../types';
import {
  createFindHook,
  createFindOneHook,
  createCreateMutation,
  createUpdateMutation,
  createDeleteMutation,
  createSingleFindHook,
  createSingleUpdateMutation,
} from './hookFactory';

// Example: Article hooks using factory pattern
export const useArticlesFactory = createFindHook<Article>(
  'articles',
  (params) => [...queryKeys.articles(), params]
);

export const useArticleFactory = createFindOneHook<Article>(
  'articles',
  (id) => queryKeys.article(id)
);

export const useCreateArticleFactory = createCreateMutation<Article>(
  'articles',
  queryKeys.articles()
);

export const useUpdateArticleFactory = createUpdateMutation<Article>(
  'articles',
  (id) => queryKeys.article(id),
  queryKeys.articles()
);

export const useDeleteArticleFactory = createDeleteMutation<Article>(
  'articles',
  (id) => queryKeys.article(id),
  queryKeys.articles()
);

// Example: Category hooks using factory pattern
export const useCategoriesFactory = createFindHook<Category>(
  'categories',
  () => queryKeys.categories()
);

export const useCategoryFactory = createFindOneHook<Category>(
  'categories',
  (id) => queryKeys.category(id)
);

// Example: Footer (single-type) hooks using factory pattern
export const useFooterFactory = createSingleFindHook<Footer>(
  'footer',
  () => queryKeys.footer()
);

export const useUpdateFooterFactory = createSingleUpdateMutation<Footer>(
  'footer',
  () => queryKeys.footer()
);

/*
Usage comparison:

// Old way (manual implementation with type issues):
export const useArticles = (params?, options?) => {
  return useQuery({
    queryKey: [...queryKeys.articles(), params],
    queryFn: async () => {
      const response = await strapiClient.collection('articles').find({
        populate: { ... } as any,  // Type casting issues
        ...params as any,          // More type casting
      });
      return response as unknown as StrapiResponse<Article>; // Unsafe casting
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// New way (factory pattern with type safety):
export const useArticles = createFindHook<Article>(
  'articles',
  (params) => [...queryKeys.articles(), params]
);

Benefits of factory pattern:
✅ Eliminates all "as any" and "as unknown as" casting
✅ Consistent patterns across all hooks
✅ Centralized type safety logic
✅ Reduced code duplication (90% less code per hook)
✅ Easier maintenance and updates
✅ Better error handling and consistency
✅ Automatic cache invalidation patterns
*/