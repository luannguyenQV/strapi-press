# @repo/strapi-client - Demo & Usage Examples

A production-ready TypeScript SDK for Strapi v5 with built-in caching, rate limiting, and React Server Component support.

## 🚀 Features

- **Type-Safe API**: Full TypeScript support with auto-generated types
- **Built-in Caching**: Smart caching with TTL and memory management
- **Rate Limiting**: Free tier protection (1M requests/month)
- **React Integration**: Server Component compatible with cache optimization
- **Performance Focused**: Optimized for production with monitoring

## 📦 Installation

```bash
# In a monorepo workspace
pnpm add @repo/strapi-client

# Environment setup
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here
```

## 🎯 Basic Usage

### Initialize Client

```typescript
import { strapi, articleService, categoryService } from '@repo/strapi-client';

// Client is auto-configured via environment variables
// Uses singleton pattern for optimal performance
```

### Direct API Calls

```typescript
// Get all articles
const articles = await strapi.find('articles', {
  populate: {
    author: { fields: ['name', 'email'] },
    category: { fields: ['name', 'slug'] },
    cover: { fields: ['url', 'alternativeText'] }
  },
  sort: ['publishedAt:desc'],
  pagination: { page: 1, pageSize: 10 }
});

// Get single article
const article = await strapi.findOne('articles', 123, {
  populate: {
    author: true,
    category: true,
    cover: true
  }
});

// Create new article
const newArticle = await strapi.create('articles', {
  title: 'My New Post',
  content: 'Article content here...',
  slug: 'my-new-post',
  publishedAt: new Date().toISOString()
});
```

## 🎨 Service Layer Examples

### Article Service

```typescript
import { articleService } from '@repo/strapi-client';

// Get featured articles
const featured = await articleService.getFeatured({ limit: 5 });

// Get articles by category
const techArticles = await articleService.getByCategory('technology', {
  page: 1,
  pageSize: 12
});

// Search articles
const searchResults = await articleService.search('react hooks', {
  limit: 10,
  includeContent: true
});

// Get article with full content
const fullArticle = await articleService.getBySlug('my-article-slug');

// Get related articles
const related = await articleService.getRelated(articleId, { limit: 4 });

// Get popular articles
const popular = await articleService.getPopular({ 
  timeframe: '30d',
  limit: 10 
});
```

### Category Service

```typescript
import { categoryService } from '@repo/strapi-client';

// Get all categories
const categories = await categoryService.getAll();

// Get category with articles count
const category = await categoryService.getBySlug('technology');

// Get category tree (if hierarchical)
const tree = await categoryService.getTree();
```

## ⚛️ React Server Components

```typescript
// app/blog/page.tsx
import { articleService } from '@repo/strapi-client';

export default async function BlogPage() {
  // Automatically cached server-side
  const { data: articles } = await articleService.getFeatured({ limit: 6 });
  const { data: categories } = await categoryService.getAll();

  return (
    <div>
      <h1>Latest Articles</h1>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

// Cached wrapper for even better performance
import { cachedFind } from '@repo/strapi-client';

export default async function OptimizedPage() {
  const articles = await cachedFind('articles', {
    populate: { author: true, cover: true },
    filters: { featured: { $eq: true } }
  });
  
  return <ArticleGrid articles={articles.data} />;
}
```

## 🔧 Advanced Configuration

### Custom Client Instance

```typescript
import { StrapiClient } from '@repo/strapi-client';

const customClient = new StrapiClient({
  apiUrl: 'https://api.mysite.com',
  apiToken: process.env.CUSTOM_STRAPI_TOKEN,
  cache: {
    enabled: true,
    ttl: 600000, // 10 minutes
    maxSize: 200
  },
  rateLimit: {
    maxRequests: 800000, // Custom limit
    windowMs: 2592000000 // 30 days
  }
});
```

### Type Definitions

```typescript
import type { Article, Category, Media } from '@repo/strapi-client';

interface BlogPageProps {
  articles: Article[];
  categories: Category[];
}

// Custom filters
interface ArticleFilters {
  title?: { $contains: string };
  category?: { slug: { $eq: string } };
  publishedAt?: { $gte: string };
  featured?: { $eq: boolean };
}
```

## 📊 Performance Monitoring

```typescript
// Check API usage
const usage = strapi.getUsageStats();
console.log({
  used: usage.used,
  remaining: usage.remaining,
  percentage: usage.percentage
});

// Clear cache when needed
strapi.clearCache();

// Monitor performance
console.time('article-fetch');
const articles = await articleService.getFeatured();
console.timeEnd('article-fetch');
```

## 🏗️ Production Patterns

### Error Handling

```typescript
try {
  const articles = await articleService.getFeatured();
  return { articles: articles.data, error: null };
} catch (error) {
  console.error('Failed to fetch articles:', error);
  return { articles: [], error: error.message };
}
```

### Loading States

```typescript
// app/blog/loading.tsx
export default function Loading() {
  return <ArticlesSkeleton />;
}

// With Suspense
<Suspense fallback={<ArticlesSkeleton />}>
  <ArticlesList />
</Suspense>
```

### SEO Integration

```typescript
// Generate metadata from article
export async function generateMetadata({ params }) {
  const article = await articleService.getBySlug(params.slug);
  
  return {
    title: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: [article.cover?.url],
    }
  };
}
```

## 🚦 Rate Limiting & Caching

```typescript
// Automatic rate limiting warnings
// ⚠️ Approaching Strapi API limit: 800000/1000000

// Cache hit/miss monitoring
const cachedResult = await cachedFind('articles', params);
// Cache automatically handles TTL and memory limits

// Manual cache management
strapi.clearCache(); // Clear all cache
// Cache is automatically cleaned when reaching maxSize
```

## 🔍 Query Examples

### Complex Filtering

```typescript
const articles = await strapi.find('articles', {
  filters: {
    $and: [
      { publishedAt: { $gte: '2024-01-01' } },
      { category: { slug: { $eq: 'technology' } } },
      { featured: { $eq: true } }
    ]
  },
  populate: {
    author: { fields: ['name'] },
    cover: { fields: ['url', 'alternativeText'] }
  },
  sort: ['viewCount:desc', 'publishedAt:desc']
});
```

### Pagination

```typescript
const page1 = await strapi.find('articles', {
  pagination: { page: 1, pageSize: 12 }
});

const page2 = await strapi.find('articles', {
  pagination: { page: 2, pageSize: 12 }
});
```

## 📈 Monitoring & Analytics

```typescript
// Track article views
await strapi.update('articles', articleId, {
  viewCount: article.viewCount + 1
});

// API health check
const health = strapi.getUsageStats();
if (health.percentage > 80) {
  // Implement cache warming or usage optimization
}
```

## 🔧 Development Tips

1. **Use TypeScript**: Full type safety with auto-completion
2. **Cache Smart**: Leverage built-in caching for performance
3. **Monitor Usage**: Keep track of API limits
4. **Error Boundaries**: Implement proper error handling
5. **SSR Optimization**: Use Server Components for better SEO

## 📚 API Reference

### StrapiClient Methods

- `find<T>(contentType, params?)` - Get multiple entries
- `findOne<T>(contentType, id, params?)` - Get single entry
- `create<T>(contentType, data)` - Create new entry
- `update<T>(contentType, id, data)` - Update entry
- `delete<T>(contentType, id)` - Delete entry

### Service Methods

#### ArticleService
- `getFeatured(params?)` - Get featured articles
- `getByCategory(slug, params?)` - Get articles by category
- `getBySlug(slug)` - Get single article
- `search(query, params?)` - Search articles
- `getRelated(id, params?)` - Get related articles
- `getPopular(params?)` - Get popular articles

#### CategoryService
- `getAll(params?)` - Get all categories
- `getBySlug(slug)` - Get category by slug
- `getTree()` - Get hierarchical tree

---

**Built for StrapiPress** - The modern WordPress alternative with Strapi + Next.js