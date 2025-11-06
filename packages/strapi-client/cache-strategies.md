# Strapi Client Cache Strategies

This document outlines different caching strategies for various types of content in your Strapi application.

## Cache Strategy Overview

Next.js `unstable_cache` with `revalidate` option controls how long cached data remains valid:

| Strategy | Revalidate Value | Use Case | Example |
|----------|------------------|----------|---------|
| **Build-time only** | `false` | Static content that never changes | Footer, site settings |
| **Very long** | `86400` (1 day) | Semi-static content | Categories, authors |
| **Long** | `1800` (30 min) | Rarely updated | Single type content |
| **Medium** | `600` (10 min) | Individual posts | Article details |
| **Short** | `300` (5 min) | Dynamic lists | Article lists, featured |
| **Real-time** | No cache | User-specific data | Search, infinite scroll |

## Implementation Examples

### 1. Build-Time Only (Cache Forever)

For content that should only be fetched during build and never revalidated:

```typescript
// Example: Site footer (changes very rarely, rebuild when needed)
const footer = await cachedFindSingleType('footer', {
  populate: { logo: true, socialLinks: true }
}, {
  revalidate: false, // ✅ Cache forever - only fetch at build time
  tags: ['footer', 'global']
});
```

```typescript
// Example: Categories (stable taxonomy)
const categories = await cachedFind('categories', {
  sort: ['name:asc'],
  pagination: { pageSize: 100 }
}, {
  revalidate: false, // ✅ Cache forever
  tags: ['categories']
});
```

### 2. Very Long Cache (1 day)

For content that changes infrequently:

```typescript
// Example: Author profiles
const authors = await cachedFind('authors', {
  populate: { avatar: true },
  sort: ['name:asc']
}, {
  revalidate: 60 * 60 * 24, // 1 day = 86400 seconds
  tags: ['authors']
});
```

### 3. Medium Cache (10 minutes)

For article details that update occasionally:

```typescript
// Example: Individual article (current default)
const article = await cachedFindOne('articles', slug, {
  populate: { author: true, category: true, cover: true }
}, {
  revalidate: 600, // 10 minutes
  tags: ['article', `article-${slug}`]
});
```

### 4. Short Cache (5 minutes)

For lists that update frequently:

```typescript
// Example: Latest articles (current implementation)
const articles = await cachedFind('articles', {
  filters: { featured: true },
  sort: ['publishedAt:desc'],
  pagination: { pageSize: 10 }
}, {
  revalidate: 300, // 5 minutes (current default)
  tags: ['articles', 'featured-articles']
});
```

### 5. No Cache (Client-Side Only)

For real-time or user-specific data, use TanStack Query hooks:

```typescript
'use client';
import { useSearchArticles } from '@repo/strapi-client/hooks';

// Example: Search results (real-time)
const { data, isLoading } = useSearchArticles(searchQuery, {
  pageSize: 10
});
```

## Cache Invalidation

When content changes, you can invalidate caches using tags:

```typescript
import { revalidateTag } from 'next/cache';

// Invalidate all articles
revalidateTag('articles');

// Invalidate specific article
revalidateTag('article-my-slug');

// Invalidate categories (if using revalidate: false, requires rebuild)
revalidateTag('categories');
```

**Important**: If you set `revalidate: false`, calling `revalidateTag()` won't work in production. You'll need to rebuild and redeploy to update that content.

## Recommended Strategy by Content Type

### Site Configuration (Cache Forever)
- **Footer**: `revalidate: false`
- **Global Settings**: `revalidate: false`
- **Navigation**: `revalidate: false`

### Taxonomies (Very Long Cache)
- **Categories**: `revalidate: 86400` (1 day) or `false`
- **Tags**: `revalidate: 86400` (1 day) or `false`
- **Authors**: `revalidate: 86400` (1 day)

### Content (Medium to Short Cache)
- **Article Lists**: `revalidate: 300` (5 min) - current ✅
- **Featured Articles**: `revalidate: 300` (5 min) - current ✅
- **Single Article**: `revalidate: 600` (10 min) - current ✅

### Interactive (No Server Cache)
- **Search**: Client-side with TanStack Query - current ✅
- **Infinite Scroll**: Client-side with TanStack Query - current ✅

## Production Considerations

### Build-Time Caching (`revalidate: false`)

**Pros**:
- Maximum performance (no API calls after build)
- Lowest hosting costs
- Best for free-tier Strapi deployments

**Cons**:
- Requires rebuild + redeploy to update content
- Not suitable for frequently changing content
- `revalidateTag()` won't work

**When to use**:
- Static site configuration (footer, navigation)
- Stable taxonomies (categories if rarely changed)
- Content that changes less than once per day

### ISR Caching (`revalidate: <seconds>`)

**Pros**:
- Content updates without rebuilds
- Works with `revalidateTag()` for on-demand updates
- Balances freshness and performance

**Cons**:
- More API calls to Strapi
- Can hit rate limits on free tiers

**When to use**:
- Regularly updated content (articles, posts)
- When you need on-demand cache invalidation
- Dynamic content that needs to stay fresh

## Example: Mixed Strategy

```typescript
// Build-time only (footer, rarely changes)
const footer = await cachedFindSingleType('footer', params, {
  revalidate: false,
  tags: ['footer']
});

// 1 day cache (categories, stable taxonomy)
const categories = await cachedFind('categories', params, {
  revalidate: 86400,
  tags: ['categories']
});

// 5 min cache (articles, frequently updated)
const articles = await cachedFind('articles', params, {
  revalidate: 300,
  tags: ['articles']
});
```

## Testing Cache Behavior

### Development
In development mode, caching is disabled by default for better DX. You'll see cache behavior in production builds.

### Production Testing
```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Check cache headers in browser DevTools (Network tab)
```

### Verify Build-Time Caching
```bash
# Build and check build logs
pnpm build

# Look for "Generating static pages" in output
# Pages using revalidate: false will be fully static
```
