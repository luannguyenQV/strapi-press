/**
 * @repo/strapi-client - Modern Strapi client with TanStack Query integration
 *
 * This package provides:
 * - Official @strapi/client integration
 * - TanStack Query hooks for client-side components and real-time data
 * - Services for Server Components and static data fetching
 * - TypeScript-first API with full type safety
 * - Best practices for query key management
 */

// Export official Strapi client and configuration
export { strapiClient, config } from './client';

// Export TanStack Query hooks (for Client Components)
export * from './hooks/articles';
export * from './hooks/categories';
export * from './hooks/footer';

// Export query keys for advanced usage
export { queryKeys } from './queries/keys';

// Export services (for Server Components and SSR)
export { articleService } from './services/article.service';
export { categoryService } from './services/category.service';
export { footerService } from './services/footer.service';

// Export all types
export * from './types';

// Legacy support - re-export for backward compatibility
export const strapi = strapiClient;
