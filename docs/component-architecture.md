# Component Architecture for Strapi + Next.js News Site

## Component Hierarchy

```
apps/web/app/
├── [locale]/
│   ├── layout.tsx                      // Root layout with providers
│   ├── page.tsx                        // Homepage
│   ├── blog/
│   │   ├── layout.tsx                  // Blog section layout
│   │   ├── page.tsx                    // Articles listing
│   │   └── [slug]/
│   │       └── page.tsx                // Article detail
│   ├── category/
│   │   ├── page.tsx                    // Categories index
│   │   └── [slug]/
│   │       └── page.tsx                // Category articles
│   ├── author/
│   │   ├── page.tsx                    // Authors directory
│   │   └── [slug]/
│   │       └── page.tsx                // Author profile
│   ├── tag/
│   │   └── [slug]/
│   │       └── page.tsx                // Tag articles
│   ├── archive/
│   │   └── [[...date]]/
│   │       └── page.tsx                // Date-based archives
│   ├── search/
│   │   └── page.tsx                    // Search results
│   ├── pricing/
│   │   └── page.tsx                    // Subscription plans
│   ├── contact/
│   │   └── page.tsx                    // Contact form
│   └── legal/
│       ├── layout.tsx                  // Legal pages layout
│       ├── privacy/
│       │   └── page.tsx                // Privacy policy
│       └── terms/
│           └── page.tsx                // Terms of service

components/
├── layout/
│   ├── header.tsx                      // Main header component
│   ├── navigation.tsx                  // Primary navigation
│   ├── mobile-menu.tsx                 // Mobile navigation
│   ├── search-command.tsx              // Command palette search
│   ├── user-menu.tsx                   // User account menu
│   ├── footer.tsx                      // Main footer
│   ├── newsletter-form.tsx             // Newsletter subscription
│   └── theme-toggle.tsx                // Dark/light mode switch
├── article/
│   ├── article-card.tsx                // Article preview card
│   ├── article-grid.tsx                // Grid layout container
│   ├── article-list.tsx                // List layout container
│   ├── article-hero.tsx                // Featured article display
│   ├── article-content.tsx             // Rich content renderer
│   ├── article-meta.tsx                // Metadata display
│   ├── article-share.tsx               // Social sharing buttons
│   ├── article-tags.tsx                // Tag pills
│   ├── related-articles.tsx            // Related content
│   └── reading-progress.tsx            // Reading progress bar
├── author/
│   ├── author-card.tsx                 // Author preview card
│   ├── author-bio.tsx                  // Full author bio
│   ├── author-articles.tsx             // Author's article list
│   └── author-social.tsx               // Social media links
├── category/
│   ├── category-card.tsx               // Category preview
│   ├── category-list.tsx               // Category listing
│   └── category-filter.tsx             // Category filter UI
├── comment/
│   ├── comment-form.tsx                // Comment submission
│   ├── comment-list.tsx                // Comments display
│   ├── comment-item.tsx                // Single comment
│   ├── comment-thread.tsx              // Nested replies
│   └── comment-moderation.tsx          // Moderation tools
├── search/
│   ├── search-bar.tsx                  // Search input
│   ├── search-results.tsx              // Results display
│   ├── search-filters.tsx              // Advanced filters
│   └── search-suggestions.tsx          // Autocomplete
└── common/
    ├── pagination.tsx                  // Pagination controls
    ├── infinite-scroll.tsx             // Infinite scroll
    ├── loading-skeleton.tsx            // Skeleton loaders
    ├── error-boundary.tsx              // Error handling
    ├── empty-state.tsx                 // Empty states
    └── breadcrumbs.tsx                 // Navigation breadcrumbs

packages/design-system/components/ui/
├── accordion.tsx                       // Accordion component
├── alert.tsx                           // Alert notifications
├── avatar.tsx                          // User avatars
├── badge.tsx                           // Status badges
├── button.tsx                          // Button variants
├── card.tsx                            // Card containers
├── dialog.tsx                          // Modal dialogs
├── dropdown-menu.tsx                   // Dropdown menus
├── form.tsx                            // Form components
├── input.tsx                           // Input fields
├── select.tsx                          // Select dropdowns
├── separator.tsx                       // Visual separators
├── skeleton.tsx                        // Loading skeletons
├── table.tsx                           // Data tables
├── tabs.tsx                            // Tab navigation
├── textarea.tsx                        // Text areas
├── toast.tsx                           // Toast notifications
└── tooltip.tsx                         // Tooltips
```

## Component Specifications

### Core Layout Components

```typescript
// apps/web/components/layout/header.tsx
import { Button } from '@repo/design-system/components/ui/button';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { useTranslations } from '@repo/internationalization';
import { SearchCommand } from './search-command';
import { MobileMenu } from './mobile-menu';
import { UserMenu } from './user-menu';
import Link from 'next/link';

interface HeaderProps {
  locale: string;
  navigation?: NavigationItem[];
  user?: User | null;
}

export function Header({ locale, navigation, user }: HeaderProps) {
  const t = useTranslations();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href={`/${locale}`} className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              NewsHub
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navigation?.map((item) => (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className="transition-colors hover:text-foreground/80"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <SearchCommand />
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/${locale}/sign-in`}>{t('auth.signIn')}</Link>
              </Button>
            )}
            <MobileMenu navigation={navigation} />
          </nav>
        </div>
      </div>
    </header>
  );
}
```

### Article Components

```typescript
// apps/web/components/article/article-card.tsx
import { Card, CardContent, CardHeader } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@repo/design-system/components/ui/avatar';
import { strapi } from '@repo/strapi-client';
import { formatDate } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@repo/design-system/lib/utils';

interface ArticleCardProps {
  article: StrapiArticle;
  variant?: 'default' | 'featured' | 'compact';
  showAuthor?: boolean;
  showCategory?: boolean;
  showExcerpt?: boolean;
  locale?: string;
}

export function ArticleCard({ 
  article, 
  variant = 'default',
  showAuthor = true,
  showCategory = true,
  showExcerpt = true,
  locale = 'en'
}: ArticleCardProps) {
  const { attributes } = article;
  const coverImage = attributes.cover?.data?.attributes;
  const author = attributes.author?.data?.attributes;
  const categories = attributes.categories?.data;
  
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all hover:shadow-lg",
      variant === 'featured' && "md:col-span-2 md:row-span-2",
      variant === 'compact' && "flex flex-row"
    )}>
      {coverImage && (
        <div className={cn(
          "relative overflow-hidden bg-muted",
          variant === 'compact' ? "w-40" : "aspect-[16/9]"
        )}>
          <Image
            src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${coverImage.url}`}
            alt={coverImage.alternativeText || attributes.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={variant === 'featured' 
              ? '(max-width: 768px) 100vw, 50vw' 
              : '(max-width: 768px) 100vw, 33vw'}
          />
          {categories?.[0] && showCategory && (
            <Badge className="absolute top-2 left-2 z-10">
              {categories[0].attributes.name}
            </Badge>
          )}
        </div>
      )}
      
      <CardContent className="flex flex-1 flex-col p-6">
        <CardHeader className="p-0">
          <h3 className={cn(
            "font-bold line-clamp-2 transition-colors group-hover:text-primary",
            variant === 'featured' ? "text-2xl md:text-3xl" : "text-lg"
          )}>
            <Link href={`/${locale}/blog/${attributes.slug}`}>
              <span className="absolute inset-0 z-10" />
              {attributes.title}
            </Link>
          </h3>
        </CardHeader>
        
        {showExcerpt && attributes.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
            {attributes.description}
          </p>
        )}
        
        <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-muted-foreground">
          {showAuthor && author && (
            <div className="flex items-center gap-2">
              {author.avatar?.data && (
                <Avatar className="h-6 w-6">
                  <AvatarImage 
                    src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${author.avatar.data.attributes.url}`} 
                  />
                  <AvatarFallback>{author.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <span className="font-medium">{author.name}</span>
            </div>
          )}
          
          <time dateTime={attributes.publishedAt}>
            {formatDate(new Date(attributes.publishedAt), 'MMM dd, yyyy')}
          </time>
          
          {attributes.readingTime && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {attributes.readingTime} min read
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Strapi Content Integration

```typescript
// apps/web/components/article/article-content.tsx
import { strapi } from '@repo/strapi-client';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import Link from 'next/link';

interface ArticleContentProps {
  article: StrapiArticle;
  locale: string;
}

export function ArticleContent({ article, locale }: ArticleContentProps) {
  const { attributes } = article;
  const blocks = attributes.blocks || [];
  
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{attributes.title}</h1>
        {attributes.description && (
          <p className="text-xl text-muted-foreground">{attributes.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          {attributes.categories?.data?.map((category) => (
            <Badge key={category.id} variant="secondary">
              <Link href={`/${locale}/category/${category.attributes.slug}`}>
                {category.attributes.name}
              </Link>
            </Badge>
          ))}
        </div>
        
        <Separator className="mt-6" />
      </header>
      
      {/* Article Content Blocks */}
      <div className="space-y-8">
        {blocks.map((block, index) => (
          <ContentBlock key={index} block={block} />
        ))}
      </div>
      
      {/* Rich Text Content */}
      {attributes.content && (
        <div className="mt-8">
          <MDXRemote source={attributes.content} />
        </div>
      )}
    </div>
  );
}

interface ContentBlockProps {
  block: StrapiContentBlock;
}

function ContentBlock({ block }: ContentBlockProps) {
  switch (block.__component) {
    case 'shared.rich-text':
      return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <MDXRemote source={block.body} />
        </div>
      );
      
    case 'shared.media':
      return (
        <figure className="not-prose">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${block.file.data.attributes.url}`}
              alt={block.file.data.attributes.alternativeText || ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
          {block.file.data.attributes.caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {block.file.data.attributes.caption}
            </figcaption>
          )}
        </figure>
      );
      
    case 'shared.quote':
      return (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <blockquote className="text-lg italic font-medium">
              "{block.body}"
            </blockquote>
            {block.author && (
              <cite className="block mt-4 text-sm text-muted-foreground">
                — {block.author}
              </cite>
            )}
          </CardContent>
        </Card>
      );
      
    case 'shared.slider':
      return (
        <div className="not-prose">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {block.files.data.map((file, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${file.attributes.url}`}
                  alt={file.attributes.alternativeText || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      );
      
    default:
      return null;
  }
}
```

## Performance Optimizations

### Server Components with React Cache
```typescript
// apps/web/lib/strapi-queries.ts
import { strapi, cachedFind, cachedFindOne } from '@repo/strapi-client';
import { cache } from 'react';

// Cache article queries for 5 minutes
export const getArticles = cache(async (params?: {
  page?: number;
  pageSize?: number;
  populate?: string[];
  filters?: any;
  sort?: string[];
}) => {
  return await cachedFind('articles', {
    populate: ['author', 'categories', 'cover'],
    sort: ['publishedAt:desc'],
    ...params,
  });
});

export const getArticleBySlug = cache(async (slug: string) => {
  const { data } = await cachedFind('articles', {
    filters: { slug: { $eq: slug } },
    populate: ['author', 'categories', 'cover', 'blocks'],
  });
  return data[0] || null;
});

export const getCategoriesWithCount = cache(async () => {
  return await cachedFind('categories', {
    populate: ['articles'],
    sort: ['name:asc'],
  });
});
```

### Infinite Scroll with React Suspense
```typescript
// apps/web/components/article/article-infinite-list.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { strapi } from '@repo/strapi-client';
import { ArticleCard } from './article-card';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { useEffect } from 'react';

interface ArticleInfiniteListProps {
  initialArticles: StrapiArticle[];
  locale: string;
  filters?: any;
}

export function ArticleInfiniteList({ 
  initialArticles, 
  locale, 
  filters = {} 
}: ArticleInfiniteListProps) {
  const { ref, inView } = useInView();
  
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['articles', filters],
    queryFn: async ({ pageParam = 1 }) => {
      return await strapi.find('articles', {
        page: pageParam,
        pageSize: 12,
        populate: ['author', 'categories', 'cover'],
        sort: ['publishedAt:desc'],
        filters,
      });
    },
    getNextPageParam: (lastPage, pages) => {
      const { pagination } = lastPage.meta;
      return pagination.page < pagination.pageCount 
        ? pagination.page + 1 
        : undefined;
    },
    initialData: {
      pages: [{ data: initialArticles, meta: { pagination: { page: 1 } } }],
      pageParams: [1],
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (status === 'error') {
    return <div>Error loading articles: {error?.message}</div>;
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.pages.map((group, i) => (
          group.data.map((article: StrapiArticle) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              locale={locale}
            />
          ))
        ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className="mt-8 flex justify-center">
          {isFetchingNextPage && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
```

## State Management & Data Flow

### Client State with Zustand
```typescript
// apps/web/stores/reading-preferences.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';

interface ReadingPreferencesStore {
  // UI preferences
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  layout: 'grid' | 'list' | 'cards';
  
  // Reading behavior
  readArticles: Set<string>;
  bookmarkedArticles: Set<string>;
  readingPosition: Record<string, number>;
  
  // User interactions
  searchHistory: string[];
  categoryPreferences: string[];
  
  // Actions
  setTheme: (theme: ReadingPreferencesStore['theme']) => void;
  setFontSize: (size: ReadingPreferencesStore['fontSize']) => void;
  setLayout: (layout: ReadingPreferencesStore['layout']) => void;
  markAsRead: (articleId: string) => void;
  toggleBookmark: (articleId: string) => void;
  updateReadingPosition: (articleId: string, position: number) => void;
  addToSearchHistory: (query: string) => void;
  toggleCategoryPreference: (categoryId: string) => void;
}

export const useReadingPreferences = create<ReadingPreferencesStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        theme: 'system',
        fontSize: 'medium',
        layout: 'grid',
        readArticles: new Set(),
        bookmarkedArticles: new Set(),
        readingPosition: {},
        searchHistory: [],
        categoryPreferences: [],
        
        // Theme actions
        setTheme: (theme) => set({ theme }),
        setFontSize: (fontSize) => set({ fontSize }),
        setLayout: (layout) => set({ layout }),
        
        // Reading actions
        markAsRead: (articleId) =>
          set((state) => ({
            readArticles: new Set([...state.readArticles, articleId]),
          })),
        
        toggleBookmark: (articleId) =>
          set((state) => {
            const bookmarked = new Set(state.bookmarkedArticles);
            if (bookmarked.has(articleId)) {
              bookmarked.delete(articleId);
            } else {
              bookmarked.add(articleId);
            }
            return { bookmarkedArticles: bookmarked };
          }),
        
        updateReadingPosition: (articleId, position) =>
          set((state) => ({
            readingPosition: {
              ...state.readingPosition,
              [articleId]: position,
            },
          })),
        
        addToSearchHistory: (query) =>
          set((state) => {
            const history = [query, ...state.searchHistory.filter(q => q !== query)];
            return { searchHistory: history.slice(0, 10) }; // Keep last 10
          }),
        
        toggleCategoryPreference: (categoryId) =>
          set((state) => {
            const preferences = [...state.categoryPreferences];
            const index = preferences.indexOf(categoryId);
            if (index > -1) {
              preferences.splice(index, 1);
            } else {
              preferences.push(categoryId);
            }
            return { categoryPreferences: preferences };
          }),
      }),
      {
        name: 'reading-preferences',
        // Custom serializer for Sets
        serialize: (state) => JSON.stringify({
          ...state.state,
          readArticles: Array.from(state.state.readArticles),
          bookmarkedArticles: Array.from(state.state.bookmarkedArticles),
        }),
        deserialize: (str) => {
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            readArticles: new Set(parsed.readArticles || []),
            bookmarkedArticles: new Set(parsed.bookmarkedArticles || []),
          };
        },
      }
    )
  )
);
```

### Server State with TanStack Query
```typescript
// apps/web/hooks/use-articles.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { strapi } from '@repo/strapi-client';

export function useArticles(filters: any = {}, pageSize = 12) {
  return useInfiniteQuery({
    queryKey: ['articles', filters],
    queryFn: async ({ pageParam = 1 }) => {
      return await strapi.find('articles', {
        page: pageParam,
        pageSize,
        populate: ['author', 'categories', 'cover'],
        sort: ['publishedAt:desc'],
        filters,
      });
    },
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.meta;
      return pagination.page < pagination.pageCount 
        ? pagination.page + 1 
        : undefined;
    },
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data } = await strapi.find('articles', {
        filters: { slug: { $eq: slug } },
        populate: ['author', 'categories', 'cover', 'blocks'],
      });
      return data[0] || null;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => strapi.find('categories', {
      sort: ['name:asc'],
      populate: ['articles'],
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

### Type Definitions
```typescript
// apps/web/types/strapi.ts
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiArticle {
  id: number;
  attributes: {
    title: string;
    slug: string;
    description?: string;
    content?: string;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    readingTime?: number;
    
    // Relations
    author?: {
      data: {
        id: number;
        attributes: {
          name: string;
          email: string;
          bio?: string;
          avatar?: StrapiImage;
        };
      };
    };
    
    categories?: {
      data: Array<{
        id: number;
        attributes: {
          name: string;
          slug: string;
          description?: string;
        };
      }>;
    };
    
    cover?: StrapiImage;
    blocks?: StrapiContentBlock[];
  };
}

export interface StrapiImage {
  data: {
    id: number;
    attributes: {
      name: string;
      alternativeText?: string;
      caption?: string;
      width: number;
      height: number;
      formats: Record<string, any>;
      url: string;
    };
  };
}

export interface StrapiContentBlock {
  id: number;
  __component: string;
  [key: string]: any;
}
```
```