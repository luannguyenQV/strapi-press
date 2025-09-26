/**
 * @repo/strapi-client - Modern Strapi client with TanStack Query integration
 *
 * This package provides:
 * - Official @strapi/client integration
 * - TanStack Query hooks for client-side data fetching and mutations
 * - SSR utilities for Server Components with prefetch functions
 * - TypeScript-first API with full type safety
 * - Query key management and cache optimization
 */

// Export official Strapi client and configuration
export { strapiClient, config, cachedFind, cachedFindOne } from './client';

// Export TanStack Query hooks (for Client Components)
export * from './hooks/articles';
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
