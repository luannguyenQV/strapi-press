# @repo/strapi-client

Modern Strapi client with TanStack Query integration for Next.js applications.

## Overview

This package provides two complementary approaches for data fetching:

- **TanStack Query Hooks**: For Client Components with real-time data, caching, and mutations
- **Services**: For Server Components and static site generation (SSG/SSR)

## Installation

The package is already configured in your workspace. Dependencies are automatically installed:

- `@strapi/client` - Official Strapi JavaScript client
- `@tanstack/react-query` - Powerful data synchronization for React

## Usage

### For Server Components (Recommended for SSR/SSG)

Use services for Server Components where you need data at build time or server-side rendering:

```tsx
import { articleService, footerService } from '@repo/strapi-client';

// Server Component - runs on the server
export async function ArticlesPage() {
  const articles = await articleService.getFeaturedArticles(6);
  const footer = await footerService.getFooter();

  return (
    <div>
      {articles.data.map(article => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
}
```

### For Client Components (Interactive Features)

Use TanStack Query hooks for Client Components that need real-time data, caching, and mutations:

```tsx
'use client';
import { useArticles, useCreateArticle } from '@repo/strapi-client';

export function InteractiveArticles() {
  const { data: articles, isLoading, error } = useArticles({
    pagination: { page: 1, pageSize: 10 }
  });

  const createMutation = useCreateArticle();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {articles?.data.map(article => (
        <div key={article.id}>{article.title}</div>
      ))}
      <button
        onClick={() => createMutation.mutate({ title: 'New Article' })}
      >
        Create Article
      </button>
    </div>
  );
}
```

## Available Hooks (Client Components)

### Articles
- `useArticles(params?, options?)` - Get paginated articles
- `useArticle(id, options?)` - Get single article by ID
- `useArticleBySlug(slug, options?)` - Get article by slug
- `useFeaturedArticles(limit?, options?)` - Get featured articles
- `useCreateArticle()` - Create new article
- `useUpdateArticle()` - Update existing article
- `useDeleteArticle()` - Delete article

### Categories
- `useCategories(options?)` - Get all categories
- `useCategory(id, options?)` - Get single category
- `useCategoryBySlug(slug, options?)` - Get category by slug
- `useCreateCategory()` - Create new category
- `useUpdateCategory()` - Update existing category
- `useDeleteCategory()` - Delete category

### Footer
- `useFooter(options?)` - Get footer data (single type)
- `useUpdateFooter()` - Update footer data

## Available Services (Server Components)

### Article Service
```tsx
import { articleService } from '@repo/strapi-client';

// Get featured articles
const articles = await articleService.getFeaturedArticles(6);

// Get article by slug
const article = await articleService.getArticleBySlug('my-article');

// Get articles with pagination
const paginatedArticles = await articleService.getArticles({
  page: 1,
  pageSize: 10,
  filters: { featured: { $eq: true } }
});
```

### Footer Service
```tsx
import { footerService } from '@repo/strapi-client';

// Get footer data
const footer = await footerService.getFooter();

// Get footer with specific locale
const footer = await footerService.getFooter('es');
```

## Setup

The package is automatically set up in your Next.js app. The QueryClient provider is configured in:
- `apps/web/lib/providers.tsx`
- Wrapped in `apps/web/app/[locale]/layout.tsx`

### Cache Configuration

**TanStack Query (Hooks)**:
- Stale time: 5 minutes
- Cache time: 10 minutes
- Automatic background refetch
- Optimistic updates

**Services**:
- Footer: 1 minute cache
- Articles: Uses React Server Components caching

## Query Keys

All hooks use a hierarchical query key structure:

```tsx
import { queryKeys } from '@repo/strapi-client';

// Examples:
queryKeys.all              // ['strapi']
queryKeys.articles()       // ['strapi', 'articles']
queryKeys.article('123')   // ['strapi', 'articles', '123']
queryKeys.categories()     // ['strapi', 'categories']
queryKeys.footer()         // ['strapi', 'footer']
```

## TypeScript Support

All functions are fully typed with generated Strapi types:

```tsx
import type { Article, Category, Footer } from '@repo/strapi-client';

const article: Article = await articleService.getArticleBySlug('slug');
```

## Best Practices

### When to Use Services vs Hooks

**Use Services for**:
- Server Components
- Static Site Generation (SSG)
- Server-Side Rendering (SSR)
- SEO-critical content
- Initial page load data

**Use Hooks for**:
- Client Components
- Interactive features
- Real-time data updates
- User-triggered actions (CRUD operations)
- Data that changes frequently

### Performance Tips

1. **Server Components**: Preferred for initial page load and SEO
2. **Client Components**: Use for dynamic, interactive features
3. **Hybrid Approach**: Load initial data with services, use hooks for updates
4. **Query Invalidation**: Use query keys to invalidate related data after mutations

## Migration from Legacy Client

If you're migrating from the old custom client:

1. **Server Components**: Update imports from services - no functional changes needed
2. **Client Components**: Replace direct API calls with TanStack Query hooks
3. **Legacy Support**: The old `strapi` instance is still available for backward compatibility

## Error Handling

### Hooks (Automatic with TanStack Query)
```tsx
const { data, isLoading, error, retry } = useArticles();

if (error) {
  return <div>Error: {error.message} <button onClick={retry}>Retry</button></div>;
}
```

### Services (Manual)
```tsx
try {
  const articles = await articleService.getFeaturedArticles();
} catch (error) {
  console.error('Failed to fetch articles:', error);
  // Handle error appropriately
}
```