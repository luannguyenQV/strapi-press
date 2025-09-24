/**
 * Centralized query key management
 * Following TanStack Query best practices for hierarchical keys
 */

export const queryKeys = {
  // All Strapi queries
  all: ['strapi'] as const,

  // Articles
  articles: () => [...queryKeys.all, 'articles'] as const,
  article: (id: string) => [...queryKeys.articles(), id] as const,
  articlesByCategory: (categoryId: string) => [...queryKeys.articles(), 'category', categoryId] as const,

  // Categories
  categories: () => [...queryKeys.all, 'categories'] as const,
  category: (id: string) => [...queryKeys.categories(), id] as const,

  // Footer (single type)
  footer: () => [...queryKeys.all, 'footer'] as const,

  // Authors
  authors: () => [...queryKeys.all, 'authors'] as const,
  author: (id: string) => [...queryKeys.authors(), id] as const,
} as const;

export type QueryKeys = typeof queryKeys;