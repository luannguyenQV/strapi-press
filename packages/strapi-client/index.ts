/**
 * @repo/strapi-client - Modern Strapi client with Next.js ISR + TanStack Query
 *
 * This package provides:
 * - Official @strapi/client integration with Next.js ISR caching
 * - TanStack Query hooks for interactive features only (search, likes, comments)
 * - SSR utilities for Server Components with prefetch functions
 * - TypeScript-first API with full type safety
 * - Query key management and cache optimization
 *
 * Architecture:
 * - Static content (articles, categories): Use cachedFind/cachedFindOne in Server Components
 * - Interactive features (search, likes): Use TanStack Query hooks in Client Components
 * - See docs/data-flow.md for detailed architecture
 */

// Export official Strapi client and configuration
export {
  strapiClient,
  config,
  cachedFind,
  cachedFindOne,
  cachedFindSingleType,
  type CacheOptions,
} from './client';

// Export TanStack Query hooks (for Client Components - Interactive features only)
export {
  useSearchArticles,
  useIncrementViewCount,
  useInfiniteArticles,
} from './hooks/articles';
export * from './hooks/categories';
export * from './hooks/footer';

// Export SSR utilities (for Server Components and prefetching)
export * from './ssr';

// Export query keys for advanced usage
export { queryKeys } from './queries/keys';

// Export all types
export * from './types';

// Export hook factory utilities for advanced usage
export * from './utils/hookFactory';

// Legacy support - re-export for backward compatibility
export { strapiClient as strapi } from './client';

export { DEFAULT_PAGE_SIZE } from './constant';
