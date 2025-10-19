import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { type Article, cachedFind } from '@repo/strapi-client';
import { Calendar, Clock, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * FeaturedArticles - Server Component with ISR caching
 *
 * This component fetches featured articles from Strapi and displays them
 * in a hero layout (1 main + 2 secondary articles).
 *
 * PPR Usage: Wrap this component in <Suspense> with FeaturedArticlesSkeleton
 * to enable Partial Prerendering for optimal performance.
 */
export async function FeaturedArticles() {
  try {
    // Fetch featured articles with ISR caching
    const response = await cachedFind('articles', {
      filters: { featured: true },
      sort: ['publishedAt:desc'],
      pagination: { pageSize: 1 }, // 1 main + 2 secondary
      populate: {
        author: true,
        category: true,
        cover: true,
      }
    }, {
      revalidate: 300, // 5 minutes - featured articles change moderately
      tags: ['articles', 'featured-articles', 'homepage']
    });

    const articles = (response?.data as unknown as Article[]) || [];

    if (!articles || articles.length === 0) {
      return null;
    }

    const featuredArticle = articles[0];
    const recentArticles = articles.slice(1, 3);

    return (
      <div className='mb-12 space-y-8'>
        {/* Main Featured Article */}
        <Card className='overflow-hidden border-0'>
          <div className='grid gap-0 md:grid-cols-2'>
            <div className='flex flex-col justify-center'>
              {featuredArticle.cover?.url && (
                <Link href={`/blog/${featuredArticle.slug}`} className="block">
                  <div className='relative aspect-[16/9] overflow-hidden md:rounded'>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${featuredArticle.cover.url}`}
                      alt={featuredArticle.cover.alternativeText || featuredArticle.title}
                      fill
                      className='object-cover transition-transform duration-300 hover:scale-105'
                      priority // Prioritize loading main featured image
                    />
                  </div>
                </Link>
              )}
            </div>

            <div className='flex flex-col justify-center p-8'>
              {featuredArticle.category && (
                <Link href={`/category/${featuredArticle.category.slug}`}>
                  <Badge variant="secondary" className='mb-4 w-fit cursor-pointer capitalize transition-colors hover:bg-secondary/80'>
                    {featuredArticle.category.name}
                  </Badge>
                </Link>
              )}

              <h1 className='mb-4 font-bold text-2xl leading-tight transition-colors hover:text-primary md:text-3xl'>
                <Link href={`/blog/${featuredArticle.slug}`}>
                  {featuredArticle.title}
                </Link>
              </h1>

              <p className='mb-6 text-muted-foreground leading-relaxed'>
                {featuredArticle.description}
              </p>

              <div className='mb-6 flex items-center gap-4 text-muted-foreground text-sm'>
                {featuredArticle.author && (
                  <div className="flex items-center gap-2">
                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-muted'>
                      <User className="h-3 w-3" />
                    </div>
                    <span className="font-medium">{featuredArticle.author.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Secondary Featured Articles */}
        {recentArticles.length > 0 && (
          <div className="space-y-6">
            <div className='grid gap-6 md:grid-cols-2'>
              {recentArticles.map((article) => (
                <Card key={article.id} className='border-0 shadow-sm transition-all hover:shadow-md'>
                  <CardContent className="p-0">
                    {article.cover?.url && (
                      <Link href={`/blog/${article.slug}`}>
                        <div className='relative aspect-[16/10] overflow-hidden rounded-t-lg'>
                          <Image
                            src={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${article.cover.url}`}
                            alt={article.cover.alternativeText || article.title}
                            fill
                            className='object-cover transition-transform duration-300 hover:scale-105'
                          />
                        </div>
                      </Link>
                    )}

                    <div className="p-6">
                      <h3 className='mb-3 font-semibold text-lg leading-tight transition-colors hover:text-primary'>
                        <Link href={`/blog/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>

                      <p className='mb-4 line-clamp-3 text-muted-foreground text-sm leading-relaxed'>
                        {article.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className='flex items-center gap-3 text-muted-foreground text-xs'>
                          {article.author && <span>{article.author.name}</span>}
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <div className='flex items-center gap-1 text-muted-foreground text-xs'>
                          <Clock className="h-3 w-3" />
                          <span>{article.readingTime || 5} min</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    // Gracefully handle errors - return null instead of breaking the page
    return null;
  }
}
