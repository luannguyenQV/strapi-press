import {
  TypographyH1,
  TypographyP,
} from '@repo/design-system';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, } from '@repo/design-system/components/ui/card';
import { type Article, cachedFind } from '@repo/strapi-client';
import { Calendar, User } from 'lucide-react';
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

    return (
      <Card className='overflow-hidden border-0'>
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
          {featuredArticle.category && (
            <div className='absolute top-4 left-4'>
              <Link href={`/category/${featuredArticle.category.slug}`}>
                <Badge variant="secondary" className='mb-5 w-fit cursor-pointer capitalize transition-colors hover:bg-secondary/80'>
                  {featuredArticle.category.name}
                </Badge>
              </Link>
            </div>
          )}
        </div>

        <div className='flex flex-col justify-center p-8 md:p-2 lg:p-4'>
          <TypographyH1 className='mb-5 text-2xl transition-colors hover:text-primary md:text-3xl lg:text-4xl'>
            <Link href={`/blog/${featuredArticle.slug}`}>
              {featuredArticle.title}
            </Link>
          </TypographyH1>

          <TypographyP className='mb-8 text-base text-muted-foreground md:text-lg [&:not(:first-child)]:mt-0'>
            {featuredArticle.description}
          </TypographyP>

          <div className='mb-6 flex items-center gap-6 text-muted-foreground text-sm'>
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
      </Card>
    );
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    // Gracefully handle errors - return null instead of breaking the page
    return null;
  }
}
