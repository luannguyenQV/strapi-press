# Component Architecture for News Site

## Component Hierarchy

```
app/
├── [locale]/
│   ├── layout.tsx                      // Root layout with providers
│   ├── page.tsx                        // Homepage
│   ├── (news)/
│   │   ├── layout.tsx                  // News section layout
│   │   ├── page.tsx                    // Articles listing
│   │   ├── [slug]/
│   │   │   └── page.tsx               // Article detail
│   │   ├── category/
│   │   │   ├── page.tsx              // Categories index
│   │   │   └── [slug]/
│   │   │       └── page.tsx          // Category articles
│   │   ├── author/
│   │   │   ├── page.tsx              // Authors directory
│   │   │   └── [slug]/
│   │   │       └── page.tsx          // Author profile
│   │   ├── tag/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          // Tag articles
│   │   └── archive/
│   │       └── [year]/
│   │           └── [month]/
│   │               └── page.tsx      // Monthly archives
│   ├── search/
│   │   └── page.tsx                  // Search results
│   └── components/
│       ├── layout/
│       │   ├── header/
│       │   │   ├── index.tsx         // Main header
│       │   │   ├── navigation.tsx    // Navigation menu
│       │   │   ├── search-bar.tsx    // Search component
│       │   │   └── user-menu.tsx     // User actions
│       │   ├── footer/
│       │   │   ├── index.tsx         // Main footer
│       │   │   ├── newsletter.tsx    // Newsletter signup
│       │   │   └── social-links.tsx  // Social media
│       │   └── sidebar/
│       │       ├── index.tsx         // Sidebar container
│       │       ├── trending.tsx      // Trending articles
│       │       ├── categories.tsx    // Category list
│       │       ├── tags.tsx          // Tag cloud
│       │       └── archives.tsx      // Archive links
│       ├── article/
│       │   ├── article-card.tsx      // Article preview card
│       │   ├── article-grid.tsx      // Grid layout
│       │   ├── article-list.tsx      // List layout
│       │   ├── article-hero.tsx      // Featured article
│       │   ├── article-content.tsx   // Rich content renderer
│       │   ├── article-meta.tsx      // Author, date, reading time
│       │   ├── article-share.tsx     // Social sharing
│       │   ├── article-tags.tsx      // Tag display
│       │   └── related-articles.tsx  // Related content
│       ├── comment/
│       │   ├── comment-form.tsx      // Comment submission
│       │   ├── comment-list.tsx      // Comments display
│       │   ├── comment-item.tsx      // Single comment
│       │   └── comment-thread.tsx    // Nested replies
│       ├── author/
│       │   ├── author-card.tsx       // Author preview
│       │   ├── author-bio.tsx        // Full bio
│       │   └── author-articles.tsx   // Author's articles
│       └── ui/
│           ├── pagination.tsx        // Pagination controls
│           ├── loading.tsx           // Loading states
│           ├── error.tsx             // Error boundaries
│           └── empty.tsx             // Empty states
```

## Component Specifications

### Core Layout Components

```typescript
// components/layout/header/index.tsx
interface HeaderProps {
  locale: string;
  navigation: NavigationItem[];
  user?: User;
}

export function Header({ locale, navigation, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <Logo />
          <Navigation items={navigation} />
          <div className="flex items-center gap-4">
            <SearchBar />
            <ThemeToggle />
            <LanguageSwitcher locale={locale} />
            {user ? <UserMenu user={user} /> : <SignInButton />}
          </div>
        </div>
      </div>
    </header>
  );
}
```

### Article Components

```typescript
// components/article/article-card.tsx
interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
  showAuthor?: boolean;
  showCategory?: boolean;
  showExcerpt?: boolean;
}

export function ArticleCard({ 
  article, 
  variant = 'default',
  showAuthor = true,
  showCategory = true,
  showExcerpt = true 
}: ArticleCardProps) {
  return (
    <article className={cn(
      "group relative flex flex-col overflow-hidden rounded-lg border",
      variant === 'featured' && "md:col-span-2 md:row-span-2",
      variant === 'compact' && "flex-row"
    )}>
      {article.featuredImage && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alternativeText || article.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes={variant === 'featured' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
          />
          {article.categories?.[0] && showCategory && (
            <Badge className="absolute top-2 left-2">
              {article.categories[0].name}
            </Badge>
          )}
        </div>
      )}
      
      <div className="flex flex-1 flex-col p-4">
        <h3 className={cn(
          "font-bold line-clamp-2 group-hover:text-primary transition-colors",
          variant === 'featured' ? "text-2xl md:text-3xl" : "text-lg"
        )}>
          <Link href={`/news/${article.slug}`}>
            <span className="absolute inset-0" />
            {article.title}
          </Link>
        </h3>
        
        {showExcerpt && article.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>
        )}
        
        <div className="mt-auto flex items-center gap-4 pt-4 text-sm text-muted-foreground">
          {showAuthor && article.author && (
            <div className="flex items-center gap-2">
              {article.author.avatar && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={article.author.avatar.url} />
                  <AvatarFallback>{article.author.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <span>{article.author.name}</span>
            </div>
          )}
          
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
          
          {article.readingTime && (
            <span>{article.readingTime} min read</span>
          )}
        </div>
      </div>
    </article>
  );
}
```

### Comment System Components

```typescript
// components/comment/comment-form.tsx
interface CommentFormProps {
  articleId: number;
  parentCommentId?: number;
  onSuccess?: () => void;
}

export function CommentForm({ articleId, parentCommentId, onSuccess }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
      authorName: '',
      authorEmail: '',
    },
  });
  
  async function onSubmit(data: CommentInput) {
    setIsSubmitting(true);
    
    try {
      await articleService.createComment(articleId, {
        ...data,
        parentCommentId,
      });
      
      toast.success('Comment submitted for moderation');
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="authorEmail"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="email" placeholder="Your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Post Comment'
          )}
        </Button>
      </form>
    </Form>
  );
}
```

## Performance Optimizations

### Image Optimization
```typescript
// components/ui/optimized-image.tsx
export function OptimizedImage({ 
  src, 
  alt, 
  priority = false,
  ...props 
}: ImageProps) {
  // Use Cloudinary transformations for optimal delivery
  const optimizedSrc = getCloudinaryUrl(src, {
    width: props.width,
    height: props.height,
    quality: 'auto',
    format: 'auto',
    crop: props.fill ? 'fill' : 'scale',
  });
  
  return (
    <Image
      {...props}
      src={optimizedSrc}
      alt={alt}
      priority={priority}
      placeholder="blur"
      blurDataURL={getBlurDataUrl(src)}
    />
  );
}
```

### Infinite Scroll
```typescript
// components/article/article-infinite-list.tsx
export function ArticleInfiniteList({ initialArticles }: { initialArticles: Article[] }) {
  const { ref, inView } = useInView();
  const [articles, setArticles] = useState(initialArticles);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading]);
  
  async function loadMore() {
    setIsLoading(true);
    
    try {
      const response = await articleService.getArticles({ page });
      
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setArticles(prev => [...prev, ...response.data]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to load more articles:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      
      {hasMore && (
        <div ref={ref} className="mt-8 flex justify-center">
          {isLoading && <Spinner />}
        </div>
      )}
    </>
  );
}
```

## State Management

```typescript
// stores/news-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NewsStore {
  // User preferences
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  layout: 'grid' | 'list';
  
  // Reading history
  readArticles: Set<string>;
  bookmarks: Set<string>;
  
  // Actions
  setTheme: (theme: NewsStore['theme']) => void;
  setFontSize: (size: NewsStore['fontSize']) => void;
  setLayout: (layout: NewsStore['layout']) => void;
  markAsRead: (articleId: string) => void;
  toggleBookmark: (articleId: string) => void;
}

export const useNewsStore = create<NewsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      fontSize: 'medium',
      layout: 'grid',
      readArticles: new Set(),
      bookmarks: new Set(),
      
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLayout: (layout) => set({ layout }),
      
      markAsRead: (articleId) =>
        set((state) => ({
          readArticles: new Set([...state.readArticles, articleId]),
        })),
      
      toggleBookmark: (articleId) =>
        set((state) => {
          const bookmarks = new Set(state.bookmarks);
          if (bookmarks.has(articleId)) {
            bookmarks.delete(articleId);
          } else {
            bookmarks.add(articleId);
          }
          return { bookmarks };
        }),
    }),
    {
      name: 'news-preferences',
    }
  )
);
```