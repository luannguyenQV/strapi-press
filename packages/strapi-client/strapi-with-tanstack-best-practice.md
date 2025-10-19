# Strapi with TanStack Query - Best Practices Guide

## Table of Contents
- [SSR (Server-Side Rendering) Best Practices](#ssr-server-side-rendering-best-practices)
- [Client-Side Data Fetching](#client-side-data-fetching)
- [Cache Management](#cache-management)
- [Performance Optimization](#performance-optimization)
- [Error Handling](#error-handling)
- [TypeScript Integration](#typescript-integration)

## SSR (Server-Side Rendering) Best Practices

### When to Use SSR vs Client-Side Fetching

#### Use SSR When:
- **SEO is critical** - Search engines need to see your content
- **Initial page load performance matters** - Eliminate loading spinners
- **Content is public and cacheable** - Blog posts, product pages, marketing pages
- **Building with Next.js App Router** - Server Components are the default

#### Use Client-Side When:
- **Data is user-specific** - Dashboards, profiles, personalized content
- **Real-time updates needed** - Live feeds, notifications, chat
- **Heavy interactivity** - Forms, filters, sorting, pagination
- **Authentication required** - Private data that shouldn't be cached

### SSR Implementation Patterns

#### 1. Basic Server Component with Prefetch

```tsx
// app/articles/page.tsx
import { prefetchArticles, createSSRQueryClient } from '@repo/strapi-client';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import ArticleList from './ArticleList';

export default async function ArticlesPage() {
  const queryClient = createSSRQueryClient();

  // Prefetch data on server
  await prefetchArticles(queryClient, {
    pageSize: 10,
    sort: ['publishedAt:desc'],
    populate: {
      author: { populate: ['avatar'] },
      category: true,
      cover: true
    }
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticleList /> {/* Client component uses useArticles() */}
    </HydrationBoundary>
  );
}
```

#### 2. Parallel Data Fetching for Performance

```tsx
// app/page.tsx - Homepage with multiple data requirements
export default async function HomePage() {
  const queryClient = createSSRQueryClient();

  // Fetch multiple resources in parallel
  const [articles, categories, footer] = await Promise.all([
    prefetchFeaturedArticles(queryClient, 6),
    prefetchCategories(queryClient),
    prefetchFooter(queryClient)
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Hero />
      <FeaturedArticles />
      <CategoryNav />
    </HydrationBoundary>
  );
}
```

#### 3. Dynamic Routes with SSR

```tsx
// app/articles/[slug]/page.tsx
import { prefetchArticleBySlug, createSSRQueryClient } from '@repo/strapi-client';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string };
}

export default async function ArticlePage({ params }: PageProps) {
  const queryClient = createSSRQueryClient();

  try {
    await prefetchArticleBySlug(queryClient, params.slug);
  } catch (error) {
    notFound(); // Handle 404
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticleDetail slug={params.slug} />
    </HydrationBoundary>
  );
}

// Generate static params for SSG
export async function generateStaticParams() {
  const queryClient = createSSRQueryClient();
  await prefetchArticles(queryClient, { pageSize: 100 });

  const state = dehydrate(queryClient);
  const articles = state.queries[0]?.state.data?.data || [];

  return articles.map(article => ({
    slug: article.slug
  }));
}
```

#### 4. Metadata Generation with SSR

```tsx
// app/articles/[slug]/page.tsx
import { Metadata } from 'next';
import { cachedFindOne } from '@repo/strapi-client';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Use cached function for metadata to avoid duplicate requests
  const article = await cachedFindOne('articles', {
    filters: { slug: { $eq: params.slug } },
    populate: ['seo', 'author', 'cover']
  });

  if (!article) return {};

  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.description,
    openGraph: {
      images: article.cover?.url ? [article.cover.url] : [],
    },
  };
}
```

### SSR Cache Strategies

#### 1. Stale Time Configuration

```tsx
// Different cache durations based on data volatility
export const prefetchStaticContent = (queryClient: QueryClient) => {
  return queryClient.prefetchQuery({
    queryKey: ['static', 'about'],
    queryFn: fetchAboutPage,
    staleTime: 60 * 60 * 1000, // 1 hour for static content
  });
};

export const prefetchDynamicContent = (queryClient: QueryClient) => {
  return queryClient.prefetchQuery({
    queryKey: ['articles', 'latest'],
    queryFn: fetchLatestArticles,
    staleTime: 5 * 60 * 1000, // 5 minutes for dynamic content
  });
};
```

#### 2. Next.js Cache Integration

```tsx
// app/articles/page.tsx
import { unstable_cache } from 'next/cache';

// Combine Next.js caching with TanStack Query
const getCachedArticles = unstable_cache(
  async () => {
    const queryClient = createSSRQueryClient();
    await prefetchArticles(queryClient, { pageSize: 10 });
    return dehydrate(queryClient);
  },
  ['articles-list'],
  {
    revalidate: 300, // 5 minutes
    tags: ['articles'],
  }
);

export default async function ArticlesPage() {
  const dehydratedState = await getCachedArticles();

  return (
    <HydrationBoundary state={dehydratedState}>
      <ArticleList />
    </HydrationBoundary>
  );
}
```

### SSR Error Handling

#### 1. Graceful Degradation

```tsx
// app/articles/page.tsx
export default async function ArticlesPage() {
  const queryClient = createSSRQueryClient();

  try {
    await prefetchArticles(queryClient);
  } catch (error) {
    console.error('Failed to prefetch articles:', error);
    // Continue rendering with empty state
    // Client will attempt to fetch
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticleList />
    </HydrationBoundary>
  );
}
```

#### 2. Error Boundaries with Fallbacks

```tsx
// app/articles/error.tsx
'use client';

export default function ArticleError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>Failed to load articles</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### SSR Performance Tips

#### 1. Selective Field Population

```tsx
// Only fetch fields needed for initial render
await prefetchArticles(queryClient, {
  fields: ['title', 'slug', 'description', 'publishedAt'],
  populate: {
    cover: {
      fields: ['url', 'alternativeText'],
    },
    author: {
      fields: ['name'],
    },
  },
});
```

#### 2. Implement Streaming SSR

```tsx
// app/articles/page.tsx
import { Suspense } from 'react';

export default function ArticlesPage() {
  return (
    <>
      <Header /> {/* Renders immediately */}

      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticlesSection /> {/* Async component */}
      </Suspense>

      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar /> {/* Another async component */}
      </Suspense>
    </>
  );
}

async function ArticlesSection() {
  const queryClient = createSSRQueryClient();
  await prefetchArticles(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticleList />
    </HydrationBoundary>
  );
}
```

#### 3. Optimize QueryClient Configuration

```tsx
// utils/ssr.ts
export const createSSRQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Server-specific settings
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false, // Not needed on server
        refetchOnReconnect: false,   // Not needed on server
        refetchOnMount: false,        // Prevent double fetching
        retry: (failureCount, error) => {
          // Don't retry 4xx errors
          const status = (error as any)?.status;
          if (status >= 400 && status < 500) return false;
          return failureCount < 2; // Less retries on server
        },
      },
    },
  });
};
```

### SSR Testing Strategies

#### 1. Test Prefetch Functions

```tsx
// __tests__/ssr.test.ts
import { prefetchArticles, createSSRQueryClient } from '@repo/strapi-client';
import { dehydrate } from '@tanstack/react-query';

describe('SSR Prefetch', () => {
  it('should prefetch articles with correct data structure', async () => {
    const queryClient = createSSRQueryClient();
    await prefetchArticles(queryClient, { pageSize: 5 });

    const state = dehydrate(queryClient);
    const query = state.queries[0];

    expect(query.state.data).toHaveProperty('data');
    expect(query.state.data).toHaveProperty('meta');
    expect(query.state.data.data).toHaveLength(5);
  });

  it('should handle prefetch errors gracefully', async () => {
    const queryClient = createSSRQueryClient();

    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));

    await expect(prefetchArticles(queryClient)).rejects.toThrow('API Error');

    const state = dehydrate(queryClient);
    expect(state.queries).toHaveLength(0);
  });
});
```

### Migration Guide: Client to SSR

#### Before (Client-Only):

```tsx
// components/ArticleList.tsx
'use client';

export default function ArticleList() {
  const { data, isLoading } = useArticles({ pageSize: 10 });

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {data?.data.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

#### After (SSR + Client):

```tsx
// app/articles/page.tsx (Server Component)
import { prefetchArticles, createSSRQueryClient } from '@repo/strapi-client';

export default async function ArticlesPage() {
  const queryClient = createSSRQueryClient();
  await prefetchArticles(queryClient, { pageSize: 10 });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticleList />
    </HydrationBoundary>
  );
}

// components/ArticleList.tsx (Client Component)
'use client';

export default function ArticleList() {
  const { data } = useArticles({ pageSize: 10 });
  // No loading state needed - data is already there from SSR!

  return (
    <div>
      {data?.data.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

## Common SSR Pitfalls to Avoid

### 1. L Don't fetch in both metadata and page

```tsx
// Bad - Duplicates the request
export async function generateMetadata() {
  const article = await fetchArticle(); // First fetch
}

export default async function Page() {
  const article = await fetchArticle(); // Second fetch (duplicate!)
}
```

```tsx
// Good - Use cached function
import { cachedFindOne } from '@repo/strapi-client';

const getCachedArticle = (slug: string) =>
  cachedFindOne('articles', { filters: { slug: { $eq: slug } } });

export async function generateMetadata() {
  const article = await getCachedArticle(slug); // Cached
}

export default async function Page() {
  const article = await getCachedArticle(slug); // Uses cache
}
```

### 2. L Don't prefetch user-specific data

```tsx
// Bad - This will cache private data
await prefetchUserProfile(queryClient, userId);
```

```tsx
// Good - Fetch user data client-side only
'use client';
const { data } = useUserProfile(userId);
```

### 3. L Don't forget error boundaries

```tsx
// Bad - No error handling
export default async function Page() {
  await prefetchArticles(queryClient); // Could throw!
}
```

```tsx
// Good - Handle errors gracefully
export default async function Page() {
  try {
    await prefetchArticles(queryClient);
  } catch {
    // Log error, show fallback
  }
  // Continue rendering
}
```

## Monitoring & Debugging SSR

### Enable Query Debugging

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Add logging in development
        queryFn: process.env.NODE_ENV === 'development'
          ? async (context) => {
              console.log('Fetching:', context.queryKey);
              const result = await defaultQueryFn(context);
              console.log('Result:', result);
              return result;
            }
          : defaultQueryFn,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

## Conclusion

SSR with Strapi and TanStack Query provides:
-  Better SEO with content in initial HTML
-  Faster perceived performance (no loading states)
-  Smooth hydration from server to client
-  Intelligent caching at multiple levels
-  Type-safe from API to UI

Follow these patterns for optimal performance and developer experience!