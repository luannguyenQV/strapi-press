# Quick Cache Reference

## TL;DR - How to Cache Data Forever (Build-Time Only)

```typescript
import { cachedFind } from '@repo/strapi-client';

// ✅ Cache forever - only fetch during build
const categories = await cachedFind('categories', {
  sort: ['name:asc']
}, {
  revalidate: false,  // 👈 This is the key!
  tags: ['categories']
});
```

## All Caching Options

| revalidate | Behavior | When to Use |
|-----------|----------|-------------|
| `false` | Cache forever, build-time only | Footer, categories, navigation, authors |
| `86400` | Revalidate once per day | Semi-static content |
| `3600` | Revalidate once per hour | Moderately dynamic |
| `600` | Revalidate every 10 minutes | Article details (current default) |
| `300` | Revalidate every 5 minutes | Article lists (current default) |
| `60` | Revalidate every minute | Very dynamic content |
| Not set | Use default from function | Let the function decide |

## Current Implementation (Your Code)

### Categories - Recommended: Build-Time
```typescript
// ❌ Current: No specific caching for categories
// ✅ Recommended:
const categories = await cachedFind('categories', {
  sort: ['name:asc'],
  pagination: { pageSize: 100 }
}, {
  revalidate: false, // Build-time only
  tags: ['categories']
});
```

### Footer - Recommended: Build-Time
```typescript
// ❌ Current: 30 minutes (in ssr.ts)
revalidate: 30 * 60 * 1000,

// ✅ Recommended:
const footer = await cachedFindSingleType('footer', {
  populate: { logo: true, socialLinks: true, menuLinks: true }
}, {
  revalidate: false, // Build-time only
  tags: ['footer', 'global']
});
```

### Featured Articles - Keep Current (5 min)
```typescript
// ✅ Already good:
const featured = await cachedFind('articles', {
  filters: { featured: true }
}, {
  revalidate: 300, // 5 minutes - good for frequently updated
  tags: ['articles', 'featured-articles']
});
```

### Article Lists - Keep Current (5 min)
```typescript
// ✅ Already good:
const articles = await cachedFind('articles', {
  sort: ['publishedAt:desc']
}, {
  revalidate: 300, // 5 minutes - good for frequently updated
  tags: ['articles', 'articles-list']
});
```

## Implementation Checklist

For content you want to cache forever:

1. **Use in Server Components only**
   ```typescript
   // ✅ Server Component
   export async function MyComponent() {
     const data = await cachedFind(...);
   }

   // ❌ Client Component - use hooks instead
   'use client';
   export function MyComponent() {
     const { data } = useArticles(...);
   }
   ```

2. **Set revalidate: false**
   ```typescript
   await cachedFind('categories', params, {
     revalidate: false  // 👈 This!
   });
   ```

3. **Rebuild to update**
   ```bash
   pnpm build  # Fetches fresh data at build time
   ```

## Common Mistakes

❌ **Don't do this:**
```typescript
// This still makes API calls every 10 years!
revalidate: 60 * 60 * 24 * 365 * 10  // Wrong way
```

✅ **Do this instead:**
```typescript
// This makes ZERO API calls after build
revalidate: false  // Right way
```

## When to Use Each Strategy

### Build-Time Only (`revalidate: false`)
- ✅ Categories (stable taxonomy)
- ✅ Authors (rarely change)
- ✅ Footer (static configuration)
- ✅ Navigation menu (static links)
- ✅ Global settings (site title, logo, etc.)
- ❌ Articles (frequently updated)
- ❌ Comments (user-generated)
- ❌ Search results (dynamic)

### ISR with Revalidation (`revalidate: 300-600`)
- ✅ Article lists
- ✅ Featured content
- ✅ Individual articles
- ✅ Blog posts
- ❌ Real-time data
- ❌ User-specific content

### No Server Cache (Client-Side Only)
- ✅ Search results
- ✅ Infinite scroll
- ✅ User-specific data
- ✅ Real-time updates
- ❌ SEO-critical content
- ❌ Initial page load data

## Production Deployment

### With Build-Time Caching
```bash
# 1. Build (fetches all build-time cached data)
pnpm build

# 2. Deploy static files
# No API calls needed during runtime!
```

### Update Process
```bash
# When categories/footer change:
# 1. Make changes in Strapi
# 2. Rebuild and redeploy
pnpm build
# Deploy

# ISR content (articles) updates automatically
# without rebuild!
```

## Free Tier Optimization

To minimize API calls on Strapi free tier:

```typescript
// Build-time only (0 API calls after build) ✅
revalidate: false     // Categories, footer, authors

// Long cache (1 API call per day) ✅
revalidate: 86400     // Semi-static content

// Medium cache (API calls as needed) ⚠️
revalidate: 300       // Articles, frequently updated
```

This strategy keeps your free tier usage minimal while maintaining good UX!
