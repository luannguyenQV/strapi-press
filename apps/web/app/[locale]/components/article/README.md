# Article Components

Reusable components for article display throughout the application.

## Components

### ArticleListItem

Horizontal card layout for article listings with image, metadata, and content preview.

### ArticleListItemSkeleton

Loading skeleton component matching the ArticleListItem layout for PPR and Suspense boundaries.

### ArticleListItemsSkeleton

Container component that renders multiple ArticleListItemSkeleton components in a vertical list. Accepts optional `count` prop (default: 10).

**Features:**
- Responsive grid layout (image left, content right)
- Category badge overlaid on image
- Title with line clamping (2 lines)
- Description with line clamping (3 lines)
- Author, date, reading time metadata
- Hover effects and smooth transitions
- Optimized Next.js Image component

**Usage:**

```typescript
import { ArticleListItem } from '@/app/[locale]/components/article';
import type { Article } from '@repo/strapi-client';

// In your page or component
export function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <ArticleListItem
          key={article.id}
          article={article}
          locale="en"  // optional, defaults to 'en'
        />
      ))}
    </div>
  );
}
```

**Example with blog index page:**

```typescript
// app/[locale]/blog/page.tsx
import { cachedFind } from '@repo/strapi-client';
import { ArticleListItem } from '@/app/[locale]/components/article';

export default async function BlogPage({ params }: BlogProps) {
  const { locale } = await params;

  const response = await cachedFind('articles', {
    sort: ['publishedAt:desc'],
    pagination: { pageSize: 10 },
    populate: {
      author: true,
      category: true,
      cover: true,
    }
  }, {
    revalidate: 300,
    tags: ['articles', 'blog-list']
  });

  const articles = response?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="space-y-6">
        {articles.map((article) => (
          <ArticleListItem
            key={article.id}
            article={article}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}
```

**PPR Integration with Suspense:**

```typescript
// Option 1: Using ArticleListItemsSkeleton (recommended for multiple items)
import { Suspense } from 'react';
import { ArticleListItemsSkeleton } from '@/app/[locale]/components/article';

export default async function BlogPage() {
  return (
    <Suspense fallback={<ArticleListItemsSkeleton count={10} />}>
      <ArticleList />  {/* Async component that fetches data */}
    </Suspense>
  );
}

// Option 2: Using individual ArticleListItemSkeleton (for custom layouts)
import { Suspense } from 'react';
import { ArticleListItemSkeleton } from '@/app/[locale]/components/article';

export default async function ArticleListPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <ArticleListItemSkeleton key={i} />
        ))}
      </div>
    }>
      <ArticleList />  {/* Async component that fetches data */}
    </Suspense>
  );
}
```

## Design

The component follows the design pattern shown in the reference image:

- **Image**: 300px fixed width on desktop, full width on mobile
- **Aspect Ratio**: 4:3 on mobile, auto-height on desktop
- **Category Badge**: White with backdrop blur, positioned top-left on image
- **Content**: Flexible spacing, responsive padding (6 on mobile, 8 on desktop)
- **Typography**:
  - Title: xl/2xl, bold, 2-line clamp
  - Description: sm/base, 3-line clamp
  - Metadata: xs/sm, muted foreground

## Accessibility

- Semantic HTML with proper heading levels
- Alt text from Strapi cover image
- Keyboard navigation support (entire card is clickable link)
- Focus states on interactive elements
- Sufficient color contrast for text

## Performance

- Optimized Next.js Image component with proper `sizes` attribute
- Lazy loading images by default
- CSS transitions for smooth hover effects
- Line clamping prevents layout shifts
