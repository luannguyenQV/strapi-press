# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Overview

`@repo/strapi-client` is a type-safe Strapi client with Next.js ISR caching. It provides a simple, performant architecture using `unstable_cache` for persistent server-side caching.

## Key Commands

```bash
# Type checking
pnpm --filter @repo/strapi-client typecheck

# Build all packages (from monorepo root)
pnpm build

# Run web app with strapi-client (from monorepo root)
pnpm dev:web
```

## Architecture

### Core Design: Cached Functions with ISR

The package uses Next.js `unstable_cache` for persistent caching across requests. This is simpler and more efficient than TanStack Query SSR prefetch patterns for CMS/blog content.

**Key file flow:**
```
types.ts (type definitions + generic bridge functions)
    ↓
client.ts (Strapi client + cached operations using unstable_cache)
    ↓
├── hooks/*.ts (Client Component TanStack Query hooks - for interactive features)
└── Direct usage in Server Components (recommended for static content)
```

### Type Bridge System

The package bridges incompatible types between `@strapi/client` (official Strapi SDK) and custom TypeScript interfaces:

1. Strapi's auto-generated types in `apps/strapi/types/generated/contentTypes.d.ts` use complex schema attributes
2. The package transforms these into usable TypeScript interfaces via `ResolveAttributes<T>` utility type
3. Two generic bridge functions safely cast API responses:

```typescript
// Generic bridges - use these with any content type
bridgeCollectionResponse<T>(response) → StrapiResponse<T>
bridgeSingleResponse<T>(response) → StrapiSingleResponse<T>
```

### Caching Strategy

**Server-Side (Next.js ISR) - Primary Pattern:**
```typescript
import { cachedFind, cachedFindOne, cachedFindSingleType } from '@repo/strapi-client';
import type { Article, Category, Footer } from '@repo/strapi-client/types';

// Collections (5 min default revalidation)
const { data: articles } = await cachedFind<Article>('articles',
  { populate: { author: true, category: true } },
  { revalidate: 300, tags: ['articles'] }
);

// Single documents (10 min default)
const { data: article } = await cachedFindOne<Article>('articles', 'my-slug',
  { populate: { author: true } },
  { revalidate: 600, tags: ['article-my-slug'] }
);

// Singleton types like footer (30 min default)
const { data: footer } = await cachedFindSingleType<Footer>('footer',
  { populate: { socialLinks: true } },
  { revalidate: 1800, tags: ['footer'] }
);
```

- Cache keys use `fast-json-stable-stringify` for deterministic key generation
- No QueryClient needed - works directly in Server Components
- Persistent cache survives page reloads (unlike TanStack Query SSR)

**Client-Side (TanStack Query) - For Interactive Features:**
- Client hooks in `hooks/` for user-specific data (likes, bookmarks, comments)
- Automatic stale-while-revalidate for reactive updates
- Use only when you need client-side interactivity

### Hook Factory Pattern

`utils/hookFactory.ts` provides generic factories for client-side hooks:

```typescript
// Creates a collection query hook
createFindHook<T>(contentType, queryKeyFactory)

// Creates a single item query hook
createFindOneHook<T>(contentType, queryKeyFactory)

// Mutation factories with automatic cache invalidation
createCreateMutation<T>(contentType, invalidationKeys)
createUpdateMutation<T>(contentType, queryKeyFactory, invalidationKeys)
createDeleteMutation<T>(contentType, queryKeyFactory, invalidationKeys)

// Single-type (non-collection) factories
createSingleFindHook<T>(contentType, queryKeyFactory)
createSingleUpdateMutation<T>(contentType, queryKeyFactory)
```

### Query Key Management

`queries/keys.ts` provides hierarchical query keys following TanStack Query best practices:

```typescript
queryKeys.all           // ['strapi'] - invalidate everything
queryKeys.articles()    // ['strapi', 'articles'] - invalidate all articles
queryKeys.article(id)   // ['strapi', 'articles', id] - invalidate specific article
```

### Type System Layers

1. **Auto-generated types** (`apps/strapi/types/generated/`) - Source of truth from Strapi schema
2. **Entity types** (`ArticleEntity`, `CategoryEntity`) - Base fields without relations
3. **Populated types** (`Article`, `Category`) - Full types with relations for API responses
4. **Validated types** (`schemas/article.ts`) - Zod schemas for runtime validation

## Adding New Content Types

1. Add TypeScript types to `types.ts`:
   - Create entity type using `ResolveAttributes<Omit<ApiXxxXxx['attributes'], ...>>`
   - Create populated type extending entity with relations

2. Add query keys to `queries/keys.ts`

3. For client-side interactivity: Create hooks using factories from `utils/hookFactory.ts`

4. For server-side rendering: Use `cachedFind<T>` directly in Server Components

5. Export from `index.ts`

## When to Use Each Pattern

| Use Case | Pattern | Why |
|----------|---------|-----|
| Blog articles, categories | `cachedFind` | Static content, ISR caching |
| Footer, global settings | `cachedFindSingleType` | Singleton types, long cache |
| User likes/bookmarks | Client hooks | User-specific, reactive |
| Comments section | Client hooks | Real-time updates needed |
| Search results | `cachedFind` | Can cache common queries |

## Environment Variables

- `NEXT_PUBLIC_STRAPI_URL` - Strapi API base URL (default: `http://localhost:1337`)
- `STRAPI_API_TOKEN` - Optional API token for authenticated requests
