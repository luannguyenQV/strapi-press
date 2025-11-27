# @repo/strapi-client Architecture Documentation

## Package Overview
**Purpose**: Modern Strapi CMS client with TanStack Query integration for Next.js applications
**Version**: 0.0.0 (private workspace package)
**Location**: `/packages/strapi-client/`

## Core Dependencies
- **@strapi/client**: ^1.5.0 - Official Strapi SDK for type-safe API calls
- **@tanstack/react-query**: ^5.45.0 - Powerful data fetching and caching library
- **react**: ^19.0.0 - React framework

## Architecture Layers

### 1. Client Configuration Layer (`client.ts`)
- **strapiClient**: Core instance using official @strapi/client
- **Configuration**: Environment-based (NEXT_PUBLIC_STRAPI_URL, STRAPI_API_TOKEN)
- **Base URL**: Default `http://localhost:1337/api` with override capability
- **Caching**: React cache functions (`cachedFind`, `cachedFindOne`) for server-side performance

### 2. Type System Layer (`types.ts`)
- **Response Types**: `StrapiResponse<T>` (collections), `StrapiSingleResponse<T>` (single items)
- **Domain Entities**: Article, Author, Category, Footer, Media, SEO
- **Query Parameters**: FilterParams, PaginationParams, PopulateParams, SortParams
- **Bridge Pattern**: Transform functions converting Strapi responses to clean interfaces
  - `bridgeCollectionResponse<T>`: Generic collection transformer
  - `bridgeSingleResponse<T>`: Generic single item transformer
  - Use generics directly (e.g., `bridgeCollectionResponse<Article>(response)`)
- **Type Guards**: `isStrapiResponse`, `isStrapiSingleResponse` for runtime validation
- **Utility**: `safeCastParams` for type-safe parameter handling

### 3. Query Key Management (`queries/keys.ts`)
- **Hierarchical Structure**: Follows TanStack Query best practices
- **Root Key**: `['strapi']` for all queries
- **Entity Keys**: 
  - Articles: `['strapi', 'articles']` with ID/category/slug variations
  - Categories: `['strapi', 'categories']` with ID/slug variations
  - Footer: `['strapi', 'footer']` (single type)
  - Authors: `['strapi', 'authors']` with ID variations
- **Benefits**: Precise cache invalidation, query grouping, namespace isolation

### 4. Client-Side Hooks Layer (`hooks/`)
- **Pattern**: Each entity has dedicated hooks file (articles.ts, categories.ts, footer.ts)
- **Hook Types**:
  - Query hooks: `useArticles`, `useArticle`, `useArticleBySlug`
  - Mutation hooks: `useCreateArticle`, `useUpdateArticle`, `useDeleteArticle`
- **Features**:
  - Automatic population of related data (author, category, media)
  - Configurable pagination and sorting
  - Intelligent cache management (5-30 minute staleTime)
  - TypeScript-first with full type safety

### 5. Cached Operations Layer (`client.ts`)
- **ISR Caching**: Server-side data fetching with Next.js `unstable_cache`
  - `cachedFind<T>`: Collection queries with ISR (default 5 min)
  - `cachedFindOne<T>`: Single document queries (default 10 min)
  - `cachedFindSingleType<T>`: Singleton types like footer (default 30 min)
- **Cache Features**:
  - Deterministic cache keys via `fast-json-stable-stringify`
  - Tag-based invalidation with `revalidateTag()`
  - Build-time caching with `revalidate: false`
  - Persistent cache survives page reloads

### 6. Hook Factory Layer (`utils/hookFactory.ts`)
- **Purpose**: DRY principle, reduce boilerplate, ensure consistency
- **Factory Functions**:
  - `createFindHook<T>`: Generate collection query hooks
  - `createFindOneHook<T>`: Generate single item query hooks
  - `createCreateMutation<T>`: Generate create mutations
  - `createUpdateMutation<T>`: Generate update mutations
  - `createDeleteMutation<T>`: Generate delete mutations
  - `createSingleFindHook<T>`: For Strapi single types
  - `createSingleUpdateMutation<T>`: For single type updates
- **Features**:
  - Automatic cache invalidation on mutations
  - Optimistic updates for better UX
  - Type-safe throughout with generics
  - Configurable defaults (staleTime, retry logic)

## Key Architectural Patterns

### 1. Bridge Pattern
- **Problem**: Strapi's API format differs from ideal application data structure
- **Solution**: Bridge functions transform responses at the boundary
- **Benefits**: Clean internal interfaces, easier testing, API format independence

### 2. Factory Pattern
- **Problem**: Repetitive hook creation for each entity
- **Solution**: Generic factories generate type-safe hooks programmatically
- **Benefits**: 70% code reduction, consistency, easier maintenance

### 3. Hierarchical Query Keys
- **Problem**: Cache invalidation complexity
- **Solution**: Nested key structure matching data relationships
- **Benefits**: Precise invalidation, query grouping, debugging clarity

### 4. Dual-Mode Data Fetching
- **Client-Side**: React hooks with TanStack Query for interactive UIs
- **Server-Side**: Prefetch functions for SSR/SSG with Next.js
- **Benefits**: SEO optimization, faster initial loads, progressive enhancement

## Performance Optimizations

1. **Intelligent Caching**:
   - Variable staleTime (5-30 minutes based on data volatility)
   - Server-side React cache for deduplication
   - Query result caching with TanStack Query

2. **Smart Population**:
   - Selective field fetching to reduce payload
   - Nested population for related entities
   - Different population strategies for list vs. detail views

3. **Retry Strategy**:
   - Skip retries for client errors (4xx)
   - Exponential backoff for server errors
   - Maximum 3 retry attempts

## Integration Points

1. **Next.js App Router**: Full support for RSC and client components
2. **TypeScript**: Complete type safety from API to UI
3. **Environment Variables**: Configuration through env vars
4. **Monorepo**: Workspace package with proper exports

## Usage Examples

### Client Component:
```tsx
import { useArticles } from '@repo/strapi-client';

function ArticleList() {
  const { data, isLoading } = useArticles({ 
    pageSize: 10,
    filters: { featured: true }
  });
  // ...
}
```

### Server Component:
```tsx
import { cachedFind } from '@repo/strapi-client';
import type { Article } from '@repo/strapi-client/types';

async function Page() {
  const { data: articles } = await cachedFind<Article>('articles', {
    pagination: { pageSize: 10 },
    populate: { author: true, category: true },
  }, {
    revalidate: 300,
    tags: ['articles'],
  });
  // ...
}
```

## Future Considerations

1. **WebSocket Support**: Real-time updates via Strapi's WebSocket API
2. **Offline Support**: PWA capabilities with background sync
3. **GraphQL Option**: Alternative to REST for complex queries
4. **Rate Limiting**: Built-in rate limit handling for Strapi's free tier
5. **Error Boundaries**: Specialized error handling for Strapi-specific errors

## Best Practices

1. Always use the provided hooks instead of direct API calls
2. Leverage prefetch functions for SSR/SSG pages
3. Use appropriate staleTime based on data update frequency
4. Implement proper error handling with TanStack Query's error boundaries
5. Utilize the factory pattern for new entity types
6. Keep query keys hierarchical for effective cache management