# StrapiPress API Reference

Complete API documentation for the StrapiPress headless CMS platform. This guide covers all Strapi REST API endpoints, authentication, and integration patterns.

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Content Types](#content-types)
4. [Endpoints Reference](#endpoints-reference)
5. [Query Parameters](#query-parameters)
6. [Population & Relations](#population--relations)
7. [Filtering & Sorting](#filtering--sorting)
8. [Pagination](#pagination)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [Webhooks](#webhooks)
12. [Code Examples](#code-examples)

---

## API Overview

### Base URL

**Development**: `http://localhost:1337/api`
**Production**: `https://your-strapi-instance.com/api`

### API Version

Strapi 5.16.0 - REST API

### Response Format

All API responses follow this structure:

```json
{
  "data": {},
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 4,
      "total": 100
    }
  }
}
```

### Content Negotiation

```http
Content-Type: application/json
Accept: application/json
```

---

## Authentication

### Public vs. Protected Routes

**Public Routes** (No authentication required):
- `GET /api/articles` - List published articles
- `GET /api/articles/:id` - Get single article
- `GET /api/categories` - List categories
- `GET /api/authors` - List authors

**Protected Routes** (API token required):
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- All admin panel operations

### API Token Authentication

#### 1. Generate API Token

**Admin Panel**:
1. Navigate to **Settings → API Tokens**
2. Click **Create new API Token**
3. Configure:
   - **Name**: "Next.js Frontend"
   - **Token type**: "Read-only" or "Full access"
   - **Token duration**: "Unlimited"
4. Copy the generated token (shown only once)

**Environment Variable**:
```bash
# apps/web/.env.local
STRAPI_API_TOKEN=your-api-token-here
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

#### 2. Using API Token

**Server-Side (Next.js)**:
```typescript
// packages/strapi-client/client.ts
import { strapi } from '@strapi/client';

export const strapiClient = strapi({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337/api',
  token: process.env.STRAPI_API_TOKEN, // Server-side only
});
```

**HTTP Headers**:
```http
GET /api/articles HTTP/1.1
Host: localhost:1337
Authorization: Bearer YOUR_API_TOKEN_HERE
Content-Type: application/json
```

**cURL Example**:
```bash
curl -X GET http://localhost:1337/api/articles \
  -H "Authorization: Bearer YOUR_API_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### User Authentication (JWT)

For user-specific features (likes, comments, bookmarks):

#### Register User
```http
POST /api/auth/local/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "confirmed": true,
    "blocked": false
  }
}
```

#### Login User
```http
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Using JWT Token
```http
GET /api/users/me HTTP/1.1
Authorization: Bearer JWT_TOKEN_HERE
```

---

## Content Types

### Available Content Types

| Content Type | Endpoint | Description |
|--------------|----------|-------------|
| **Articles** | `/api/articles` | Blog posts with rich content |
| **Authors** | `/api/authors` | Content creators |
| **Categories** | `/api/categories` | Article categorization |
| **About** | `/api/about` | About page content |
| **Global** | `/api/global` | Site-wide settings |

### Content Type Schemas

#### Article Schema

```typescript
interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  locale: string;

  // Relations
  author: Author;
  category: Category;
  cover: Media;
  blocks: ContentBlock[];

  // SEO
  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaImage: Media;
    keywords: string;
    canonicalURL: string;
  };
}
```

#### Author Schema

```typescript
interface Author {
  id: number;
  documentId: string;
  name: string;
  email: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  avatar: Media;
  articles: Article[];
}
```

#### Category Schema

```typescript
interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  articles: Article[];
}
```

---

## Endpoints Reference

### Articles

#### List Articles

```http
GET /api/articles
```

**Query Parameters**:
- `populate` - Relations to include
- `filters` - Filter results
- `sort` - Sort order
- `pagination[page]` - Page number
- `pagination[pageSize]` - Items per page

**Example Request**:
```bash
curl "http://localhost:1337/api/articles?\
populate[author][populate]=avatar&\
populate[category]=*&\
populate[cover]=*&\
filters[category][slug][$eq]=technology&\
sort[0]=publishedAt:desc&\
pagination[page]=1&\
pagination[pageSize]=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response**:
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "title": "Getting Started with Next.js 15",
      "slug": "getting-started-nextjs-15",
      "description": "A comprehensive guide to Next.js 15 features",
      "publishedAt": "2024-03-15T10:00:00.000Z",
      "author": {
        "id": 1,
        "name": "John Doe",
        "avatar": {
          "url": "/uploads/john_avatar.jpg",
          "formats": {
            "thumbnail": { "url": "/uploads/thumbnail_john_avatar.jpg" }
          }
        }
      },
      "category": {
        "id": 2,
        "name": "Technology",
        "slug": "technology"
      },
      "cover": {
        "url": "/uploads/nextjs_cover.jpg",
        "formats": {
          "large": { "url": "/uploads/large_nextjs_cover.jpg" },
          "medium": { "url": "/uploads/medium_nextjs_cover.jpg" },
          "small": { "url": "/uploads/small_nextjs_cover.jpg" }
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 5,
      "total": 47
    }
  }
}
```

#### Get Single Article

```http
GET /api/articles/:id
GET /api/articles/:documentId
```

**Example**:
```bash
curl "http://localhost:1337/api/articles/abc123?\
populate[author][populate]=avatar&\
populate[category]=*&\
populate[cover]=*&\
populate[blocks][populate]=*" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create Article

```http
POST /api/articles
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "data": {
    "title": "New Article Title",
    "slug": "new-article-title",
    "description": "Article description",
    "content": "# Markdown content here",
    "publishedAt": "2024-03-15T10:00:00.000Z",
    "author": 1,
    "category": 2
  }
}
```

#### Update Article

```http
PUT /api/articles/:id
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "data": {
    "title": "Updated Title",
    "description": "Updated description"
  }
}
```

#### Delete Article

```http
DELETE /api/articles/:id
Authorization: Bearer YOUR_TOKEN
```

### Categories

#### List Categories

```http
GET /api/categories?populate=*
```

**Example Response**:
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "cat123",
      "name": "Technology",
      "slug": "technology",
      "description": "Latest tech news and tutorials",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Category with Articles

```http
GET /api/categories/:slug?populate[articles][populate]=author,cover
```

### Authors

#### List Authors

```http
GET /api/authors?populate[avatar]=*&populate[articles]=*
```

**Example Response**:
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "author123",
      "name": "John Doe",
      "email": "john@example.com",
      "bio": "Full-stack developer and tech writer",
      "avatar": {
        "url": "/uploads/john_avatar.jpg",
        "formats": {
          "thumbnail": { "url": "/uploads/thumbnail_john_avatar.jpg" }
        }
      },
      "articles": [
        { "id": 1, "title": "Article 1" },
        { "id": 2, "title": "Article 2" }
      ]
    }
  ]
}
```

### Global Settings

#### Get Global Settings

```http
GET /api/global?populate=deep
```

**Response**:
```json
{
  "data": {
    "id": 1,
    "siteName": "StrapiPress",
    "siteDescription": "Modern WordPress Alternative",
    "defaultSeo": {
      "metaTitle": "StrapiPress - Headless CMS Blog",
      "metaDescription": "Production-ready blog platform",
      "shareImage": { "url": "/uploads/og_image.jpg" }
    },
    "favicon": { "url": "/uploads/favicon.ico" },
    "navbar": {
      "logo": { "url": "/uploads/logo.png" },
      "links": [
        { "url": "/", "newTab": false, "text": "Home" },
        { "url": "/blog", "newTab": false, "text": "Blog" }
      ]
    },
    "footer": {
      "logo": { "url": "/uploads/logo_footer.png" },
      "columns": [
        {
          "title": "Company",
          "links": [
            { "url": "/about", "newTab": false, "text": "About" }
          ]
        }
      ]
    }
  }
}
```

---

## Query Parameters

### Populate (Relations)

Populate allows you to fetch related content in a single request.

#### Basic Populate

```http
GET /api/articles?populate=*
```

**Populates all first-level relations**:
- author
- category
- cover

#### Selective Populate

```http
GET /api/articles?populate[0]=author&populate[1]=category
```

#### Deep Populate (Nested Relations)

```http
GET /api/articles?populate[author][populate][0]=avatar
```

**Full Example**:
```http
GET /api/articles?\
populate[author][populate]=avatar&\
populate[category]=*&\
populate[cover]=*&\
populate[blocks][populate]=file
```

#### Deep Populate (All Levels)

```http
GET /api/articles?populate=deep
```

⚠️ **Warning**: Use sparingly - can significantly increase response size and processing time.

---

## Filtering & Sorting

### Filters

Strapi supports complex filtering with operators:

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equal | `filters[title][$eq]=Hello` |
| `$ne` | Not equal | `filters[title][$ne]=Hello` |
| `$lt` | Less than | `filters[id][$lt]=10` |
| `$lte` | Less than or equal | `filters[id][$lte]=10` |
| `$gt` | Greater than | `filters[id][$gt]=5` |
| `$gte` | Greater than or equal | `filters[id][$gte]=5` |
| `$in` | Included in array | `filters[id][$in][0]=1&filters[id][$in][1]=2` |
| `$notIn` | Not included in array | `filters[id][$notIn][0]=1` |
| `$contains` | Contains (case-sensitive) | `filters[title][$contains]=Hello` |
| `$notContains` | Doesn't contain | `filters[title][$notContains]=Hello` |
| `$containsi` | Contains (case-insensitive) | `filters[title][$containsi]=hello` |
| `$notContainsi` | Doesn't contain (case-insensitive) | `filters[title][$notContainsi]=hello` |
| `$null` | Is null | `filters[title][$null]=true` |
| `$notNull` | Is not null | `filters[title][$notNull]=true` |
| `$between` | Between values | `filters[createdAt][$between][0]=2024-01-01&filters[createdAt][$between][1]=2024-12-31` |
| `$startsWith` | Starts with | `filters[slug][$startsWith]=getting` |
| `$endsWith` | Ends with | `filters[slug][$endsWith]=guide` |

#### Filter Examples

**Simple Filter**:
```http
GET /api/articles?filters[slug][$eq]=my-article
```

**Multiple Filters (AND)**:
```http
GET /api/articles?\
filters[category][slug][$eq]=technology&\
filters[publishedAt][$gte]=2024-01-01
```

**OR Filters**:
```http
GET /api/articles?\
filters[$or][0][category][slug][$eq]=technology&\
filters[$or][1][category][slug][$eq]=design
```

**Complex Nested Filters**:
```http
GET /api/articles?\
filters[$and][0][category][slug][$eq]=technology&\
filters[$and][1][$or][0][title][$contains]=Next.js&\
filters[$and][1][$or][1][title][$contains]=React
```

**Search Multiple Fields**:
```http
GET /api/articles?\
filters[$or][0][title][$containsi]=javascript&\
filters[$or][1][description][$containsi]=javascript&\
filters[$or][2][content][$containsi]=javascript
```

### Sorting

#### Single Field Sort

```http
GET /api/articles?sort=publishedAt:desc
```

#### Multiple Field Sort

```http
GET /api/articles?sort[0]=publishedAt:desc&sort[1]=title:asc
```

**Common Sort Patterns**:
- `sort=publishedAt:desc` - Newest first
- `sort=publishedAt:asc` - Oldest first
- `sort=title:asc` - Alphabetical
- `sort[0]=featured:desc&sort[1]=publishedAt:desc` - Featured first, then by date

---

## Pagination

### Offset Pagination (Default)

```http
GET /api/articles?pagination[page]=1&pagination[pageSize]=25
```

**Parameters**:
- `pagination[page]` - Page number (default: 1)
- `pagination[pageSize]` - Items per page (default: 25, max: 100)
- `pagination[start]` - Offset start position
- `pagination[limit]` - Number of items to return

**Response Meta**:
```json
{
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 4,
      "total": 100
    }
  }
}
```

### Cursor-Based Pagination

For infinite scroll and real-time feeds:

```typescript
// Client-side implementation with TanStack Query
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['articles'],
  queryFn: async ({ pageParam = 1 }) => {
    return fetch(`/api/articles?pagination[page]=${pageParam}&pagination[pageSize]=12`)
      .then(res => res.json());
  },
  getNextPageParam: (lastPage) => {
    const { page, pageCount } = lastPage.meta.pagination;
    return page < pageCount ? page + 1 : undefined;
  },
});
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Invalid request parameters",
    "details": {
      "errors": [
        {
          "path": ["data", "title"],
          "message": "Title is required",
          "name": "ValidationError"
        }
      ]
    }
  }
}
```

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Handling Pattern

```typescript
async function fetchArticles() {
  try {
    const response = await fetch('/api/articles');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || 'Failed to fetch articles');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);

    // Handle specific error types
    if (error.message.includes('Rate limit')) {
      // Implement exponential backoff
      await new Promise(resolve => setTimeout(resolve, 5000));
      return fetchArticles(); // Retry
    }

    throw error;
  }
}
```

---

## Rate Limiting

### Free Tier Limits

Strapi Cloud Free Tier:
- **Requests**: 1,000 API calls/day (~42/hour, ~0.7/minute)
- **Assets**: 5GB storage
- **Database**: 500MB

### Optimization Strategies

#### 1. Server-Side Caching (ISR)

```typescript
import { unstable_cache } from 'next/cache';

export const getCachedArticles = unstable_cache(
  async () => {
    return await strapi.find('articles', { /* params */ });
  },
  ['articles'],
  { revalidate: 300 } // 5 minutes
);
```

**Benefit**: Reduces API calls by 95%+ (only revalidates every 5 minutes)

#### 2. On-Demand Revalidation

Configure Strapi webhooks to trigger cache invalidation only when content changes:

```typescript
// apps/web/app/api/revalidate/route.ts
export async function POST(request: NextRequest) {
  const { model, entry } = await request.json();

  if (model === 'article') {
    revalidateTag('articles');
    revalidatePath(`/blog/${entry.slug}`);
  }

  return NextResponse.json({ revalidated: true });
}
```

#### 3. Client-Side Caching (TanStack Query)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
```

#### 4. Request Batching

Combine multiple API calls:

```typescript
// ❌ Bad - 3 separate API calls
const articles = await fetch('/api/articles');
const categories = await fetch('/api/categories');
const authors = await fetch('/api/authors');

// ✅ Good - 1 API call with populate
const articles = await fetch('/api/articles?\
populate[author]=*&\
populate[category]=*&\
pagination[pageSize]=100');
```

### Monitoring Usage

**Strapi Dashboard**:
1. Navigate to **Settings → Global Settings**
2. View **API Usage** metrics
3. Set up alerts for 80% threshold

**Custom Logging**:
```typescript
// packages/strapi-client/client.ts
let apiCallCount = 0;

export async function monitoredFetch(url: string) {
  apiCallCount++;
  console.log(`[API] Call #${apiCallCount}: ${url}`);

  if (apiCallCount > 900) {
    console.warn('[API] Approaching daily limit (1000 calls)');
  }

  return fetch(url);
}
```

---

## Webhooks

### Webhook Configuration

Webhooks notify your Next.js app when content changes in Strapi.

#### 1. Create Webhook in Strapi

**Admin Panel**:
1. Go to **Settings → Webhooks**
2. Click **Create new webhook**
3. Configure:
   - **Name**: "Next.js Revalidation"
   - **URL**: `https://yourdomain.com/api/revalidate?secret=YOUR_SECRET`
   - **Events**: Select:
     - `entry.create`
     - `entry.update`
     - `entry.delete`
     - `entry.publish`
     - `entry.unpublish`
   - **Headers**: (optional)
     ```json
     {
       "Content-Type": "application/json"
     }
     ```

#### 2. Webhook Payload

Strapi sends this payload when content changes:

```json
{
  "event": "entry.update",
  "createdAt": "2024-03-15T10:30:00.000Z",
  "model": "article",
  "uid": "api::article.article",
  "entry": {
    "id": 1,
    "documentId": "abc123",
    "title": "Updated Article",
    "slug": "updated-article",
    "publishedAt": "2024-03-15T10:00:00.000Z"
  }
}
```

#### 3. Next.js Revalidation Handler

```typescript
// apps/web/app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  // Verify secret
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { model, entry, event } = body;

    console.log('[Webhook] Received:', { model, event, slug: entry?.slug });

    // Revalidate based on content type
    switch (model) {
      case 'article':
        // Invalidate specific article
        if (entry?.slug) {
          revalidateTag(`article-${entry.slug}`);
          revalidatePath(`/blog/${entry.slug}`);
        }

        // Invalidate article listings
        revalidateTag('articles');
        revalidatePath('/', 'page'); // Homepage
        revalidatePath('/blog', 'page'); // Blog index

        // Invalidate category pages if category changed
        if (entry?.category?.slug) {
          revalidatePath(`/category/${entry.category.slug}`);
        }
        break;

      case 'category':
        if (entry?.slug) {
          revalidateTag(`category-${entry.slug}`);
          revalidatePath(`/category/${entry.slug}`);
        }
        revalidateTag('categories');
        break;

      case 'author':
        if (entry?.slug) {
          revalidatePath(`/author/${entry.slug}`);
        }
        revalidateTag('authors');
        break;

      case 'global':
        // Revalidate entire site
        revalidateTag('global');
        revalidatePath('/', 'layout');
        break;

      default:
        console.warn('[Webhook] Unknown model:', model);
    }

    return NextResponse.json({
      revalidated: true,
      model,
      event,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({
      message: 'Error processing webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

#### 4. Environment Setup

```bash
# apps/web/.env.local
REVALIDATION_SECRET=generate-random-secret-here

# Generate secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 5. Testing Webhooks

**Manual Test**:
```bash
curl -X POST "http://localhost:3000/api/revalidate?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "entry.update",
    "model": "article",
    "entry": {
      "slug": "test-article"
    }
  }'
```

**Expected Response**:
```json
{
  "revalidated": true,
  "model": "article",
  "event": "entry.update",
  "timestamp": 1710501000000
}
```

---

## Code Examples

### Complete Integration Example

```typescript
// packages/strapi-client/ssr.ts
import { unstable_cache } from 'next/cache';
import { strapiClient } from './client';

/**
 * Fetch articles with server-side caching (ISR)
 * Revalidates every 5 minutes + on-demand via webhooks
 */
export const getArticles = unstable_cache(
  async (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    featured?: boolean;
  }) => {
    console.log('[API] Fetching articles from Strapi', params);

    const filters: any = {};

    if (params?.category) {
      filters.category = { slug: { $eq: params.category } };
    }

    if (params?.featured !== undefined) {
      filters.featured = { $eq: params.featured };
    }

    const response = await strapiClient.collection('articles').find({
      filters,
      sort: ['publishedAt:desc'],
      pagination: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 25,
      },
      populate: {
        author: {
          populate: ['avatar'],
        },
        category: true,
        cover: true,
      },
    });

    return response;
  },
  ['articles'], // Cache key
  {
    revalidate: 300, // 5 minutes
    tags: ['articles', 'articles-list'],
  }
);

/**
 * Fetch single article by slug
 */
export const getArticleBySlug = unstable_cache(
  async (slug: string) => {
    console.log('[API] Fetching article:', slug);

    const response = await strapiClient.collection('articles').find({
      filters: {
        slug: { $eq: slug },
      },
      populate: {
        author: {
          populate: ['avatar'],
        },
        category: true,
        cover: true,
        blocks: {
          populate: '*',
        },
        seo: {
          populate: ['metaImage'],
        },
      },
    });

    return response.data[0] || null;
  },
  ['article'], // Cache key prefix
  {
    revalidate: 600, // 10 minutes (articles edited less frequently)
    tags: (slug: string) => ['articles', `article-${slug}`],
  }
);

/**
 * Fetch categories with article counts
 */
export const getCategories = unstable_cache(
  async () => {
    console.log('[API] Fetching categories');

    const response = await strapiClient.collection('categories').find({
      sort: ['name:asc'],
      populate: {
        articles: {
          fields: ['id'], // Only count, don't fetch full articles
        },
      },
    });

    return response;
  },
  ['categories'],
  {
    revalidate: 300,
    tags: ['categories'],
  }
);
```

### Client-Side Interaction Example

```typescript
// apps/web/hooks/use-article-interactions.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useArticleLikes(articleId: string) {
  const queryClient = useQueryClient();

  // Fetch like status
  const { data, isLoading } = useQuery({
    queryKey: ['likes', articleId],
    queryFn: async () => {
      const res = await fetch(`/api/likes/${articleId}`);
      if (!res.ok) throw new Error('Failed to fetch likes');
      return res.json();
    },
    staleTime: 30000, // 30 seconds
  });

  // Toggle like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/likes/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to toggle like');
      return res.json();
    },

    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['likes', articleId] });

      const previous = queryClient.getQueryData(['likes', articleId]);

      queryClient.setQueryData(['likes', articleId], (old: any) => ({
        ...old,
        count: old.count + (old.liked ? -1 : 1),
        liked: !old.liked,
      }));

      return { previous };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['likes', articleId], context.previous);
      }
    },

    // Revalidate on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', articleId] });
    },
  });

  return {
    likes: data?.count || 0,
    isLiked: data?.liked || false,
    isLoading,
    toggleLike: likeMutation.mutate,
    isPending: likeMutation.isPending,
  };
}
```

---

## Best Practices

### 1. Always Use Server-Side Caching

**✅ Good**:
```typescript
const articles = await getCachedArticles(); // Uses unstable_cache
```

**❌ Bad**:
```typescript
const articles = await fetch('/api/articles'); // No caching
```

### 2. Populate Only What You Need

**✅ Good**:
```typescript
populate: {
  author: { populate: ['avatar'] }, // Only avatar
  category: { fields: ['name', 'slug'] }, // Only needed fields
}
```

**❌ Bad**:
```typescript
populate: 'deep' // Fetches everything, slow and wasteful
```

### 3. Use Webhooks for Real-Time Updates

Configure webhooks to trigger revalidation instead of relying on time-based revalidation alone.

### 4. Implement Exponential Backoff

```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();

      if (res.status === 429) {
        // Rate limited - wait with exponential backoff
        const wait = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, wait));
        continue;
      }

      throw new Error(`HTTP ${res.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
}
```

### 5. Monitor API Usage

Track API calls in development to ensure production optimization:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[API] Call count:', ++apiCallCounter);
}
```

---

## Additional Resources

- **Strapi Documentation**: https://docs.strapi.io/dev-docs/api/rest
- **Next.js Caching**: https://nextjs.org/docs/app/building-your-application/caching
- **TanStack Query**: https://tanstack.com/query/latest/docs/react/overview

---

## Support

For API issues:
1. Check Strapi logs: `apps/strapi/.tmp/data.db` or console output
2. Verify API token permissions in Strapi admin
3. Test endpoints with cURL before integrating
4. Review rate limiting if seeing 429 errors
5. Check webhook delivery in Strapi admin under Settings → Webhooks
