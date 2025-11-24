/**
 * @repo/strapi-client - Modern Strapi client with Next.js ISR + TanStack Query
 *
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

// Export SSR utilities (for Server Components and prefetching)
export * from './ssr';

// Export query keys for advanced usage
export { queryKeys } from './queries/keys';

// Export all types
export * from './types';

// Export validation schemas and utilities
export * from './schemas/article';

// Export hook factory utilities for advanced usage
export * from './utils/hookFactory';

// Export article hooks
export * from './hooks/articles';

// Legacy support - re-export for backward compatibility
export { strapiClient as strapi } from './client';

export { DEFAULT_PAGE_SIZE } from './constant';
