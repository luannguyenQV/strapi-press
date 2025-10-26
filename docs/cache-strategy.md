# Cache Strategy Documentation

## Overview

StrapiPress uses a multi-layered caching strategy combining Next.js ISR (Incremental Static Regeneration) with deterministic cache key generation for optimal performance.

## Cache Layers

### 1. Next.js Static Shell (Instant)
- **Technology**: Next.js Partial Prerendering (PPR)
- **What's Cached**: Page layout, container, Suspense boundaries
- **TTL**: Build-time (until next deployment)
- **Benefit**: Sub-50ms Time to First Byte (TTFB)

### 2. Next.js ISR Cache (5-30 minutes)
- **Technology**: `unstable_cache` with `fast-json-stable-stringify`
- **What's Cached**: Strapi API responses
- **TTL**:
  - Collections (articles): 300s (5 minutes)
  - Single documents: 600s (10 minutes)
  - Single types (footer, global): 1800s (30 minutes)
- **Benefit**: 60-90% reduction in Strapi API calls

### 3. Strapi Server Cache
- **Technology**: Strapi's internal caching
- **What's Cached**: Database query results
- **TTL**: Configurable per endpoint

## Cache Key Stability Fix

### Problem
JavaScript's `JSON.stringify()` does not guarantee consistent property ordering:
```typescript
JSON.stringify({ a: 1, b: 2 }) // '{"a":1,"b":2}'
JSON.stringify({ b: 2, a: 1 }) // '{"b":2,"a":1}' ❌ Different!
```

This creates different cache keys for semantically identical queries, causing cache misses.

### Solution: `fast-json-stable-stringify`

We use the industry-standard `fast-json-stable-stringify` library (500k+ weekly downloads) to ensure deterministic serialization:

```typescript
import stringify from 'fast-json-stable-stringify';

// These now produce IDENTICAL cache keys:
stringify({ a: 1, b: 2 }) // '{"a":1,"b":2}'
stringify({ b: 2, a: 1 }) // '{"a":1,"b":2}' ✅ Same!
```

### Implementation

**Before:**
```typescript
const cacheKey = `strapi-${contentType}-${JSON.stringify(params)}`;
unstable_cache(fn, [cacheKey], options);
```

**After:**
```typescript
import stringify from 'fast-json-stable-stringify';

unstable_cache(
  fn,
  ['strapi', contentType, stringify(params || {})],
  options
);
```

### Why This Library?

1. **Battle-tested**: Used by TanStack Query, Vercel, Next.js community
2. **Performant**: Faster than custom implementations
3. **Comprehensive**: Handles edge cases (circular refs, symbols, etc.)
4. **Lightweight**: Only 3KB gzipped
5. **Zero maintenance**: Maintained by the community

## Cache Flow Examples

### Home Page (`/`) - ISR Caching ✅

```
User Request
  ↓
Static Shell (Instant) ← PPR
  ↓
┌─────────────────────────┬─────────────────────────┐
│ FeaturedArticles        │ Articles                │
│ Cache Key:              │ Cache Key:              │
│ ['strapi',              │ ['strapi',              │
│  'articles',            │  'articles',            │
│  '{"filters":           │  '{"filters":           │
│   {"featured":true}}']  │   {"$or":[...]}}']      │
│                         │                         │
│ TTL: 300s               │ TTL: 300s               │
│ Tags: articles,         │ Tags: articles,         │
│   featured-articles     │   articles-list         │
└─────────────────────────┴─────────────────────────┘
```

**Why ISR works here:**
- ✅ Predictable cache keys (featured vs non-featured)
- ✅ High reuse rate (every visitor sees same content)
- ✅ Low memory cost (only 2 cache entries)

### Search Page (`/search`) - NO ISR Caching ❌

```
User searches "nextjs tutorial"
  ↓
Static Shell (Instant) ← PPR
  ↓
fetch('/api/search?q=nextjs+tutorial', {
  cache: 'no-store' ← ❌ NO Next.js cache (correct!)
})
  ↓
API Route → Strapi (direct query)
  ↓
Response with Edge Cache-Control:
  s-maxage=30 ← ✅ CDN caching only
```

**Why NO ISR cache is correct:**
- ❌ Unpredictable cache keys (infinite search variations)
- ❌ Low reuse rate (most searches are unique)
- ❌ High memory cost (thousands of cache entries)
- ✅ Edge caching (30s) handles query refinement
- ✅ Client caching (TanStack Query) handles per-user caching

### Performance Metrics

**Cold Cache (First Request):**
- TTFB: <50ms (static shell)
- FCP: <200ms (shell + skeletons)
- LCP: <1.5s (with Strapi fetch)

**Warm Cache (Within TTL):**
- TTFB: <50ms
- FCP: <200ms
- LCP: <500ms (cache hit)

## Cache Invalidation

### Automatic Revalidation
- After TTL expires, Next.js serves stale cache while revalidating in background
- Next request gets fresh data

### Manual Revalidation
Use Next.js `revalidateTag()` or `revalidatePath()`:

```typescript
import { revalidateTag } from 'next/cache';

// Invalidate all articles
revalidateTag('articles');

// Invalidate featured articles only
revalidateTag('featured-articles');

// Invalidate specific article
revalidateTag('articles-my-slug');
```

### Strapi Webhook Integration (Future)
Configure Strapi webhooks to trigger Next.js revalidation on content updates.

## Best Practices

### **When TO Cache (ISR)**
1. ✅ **Predictable Content**: Home page, categories, static pages
2. ✅ **High Reuse**: Content accessed by many users
3. ✅ **Low Cardinality**: Few unique cache keys
4. ✅ **Slow to Generate**: Expensive database queries or computations

### **When NOT to Cache (No-Store)**
1. ❌ **User Input**: Search queries, filters, user-specific data
2. ❌ **High Cardinality**: Infinite variations (search terms, pagination combos)
3. ❌ **Low Reuse**: One-off queries, unique user actions
4. ❌ **Fast to Generate**: Simple queries that return quickly

### **General Guidelines**
1. **Use Structured Cache Keys**: Array format for readability
2. **Tag Appropriately**: Enable granular invalidation
3. **Set Appropriate TTLs**: Balance freshness vs performance
4. **Monitor Cache Hits**: Add metrics in production
5. **Avoid Cache Pollution**: Don't cache low-value, high-cardinality data

## References

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [fast-json-stable-stringify](https://github.com/epoberezkin/fast-json-stable-stringify)
- [TanStack Query Cache Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
