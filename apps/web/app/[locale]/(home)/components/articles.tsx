import { Button } from '@repo/design-system/components/ui/button';
import type { Dictionary } from '@repo/internationalization';
import { type Article, cachedFind } from '@repo/strapi-client';
import Link from 'next/link';
import { ArticleListItem } from '../../components/article';

type ArticlesProps = {
  dictionary: Dictionary;
};

export const Articles = async (props: ArticlesProps) => {
  try {
    // Fetch featured articles from Strapi with Next.js ISR caching
    const response = await cachedFind('articles', {
      // filters: { featured: false },
      sort: ['publishedAt:desc'],
      pagination: { pageSize: 6 },
      populate: {
        author: true,
        category: true,
        cover: true,
      }
    }, {
      revalidate: 300, // 5 minutes - articles change moderately
      tags: ['articles', 'articles-list', 'featured-articles']
    });
    const articles = (response?.data as unknown as Article[]) || [];

    if (articles.length === 0) {
      return (
        <div className='w-full py-20 lg:py-40' />
      );
    }

    return (
      <div className='w-full max-w-4xl py-6'>
        <div className="container flex justify-center">
          {/* Articles List - Vertical Stack */}
          <div className="space-y-3">
            {articles.map((article: Article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>

          {/* View More Button */}
        </div>
        <div className="mt-12 flex justify-center">
          <Button asChild size="lg">
            <Link href="/blog">View All Articles</Link>
          </Button>
        </div>
      </div>
    );
  } catch {
    return (
      <div className='w-full py-20 lg:py-40'>
        <div className="container mx-auto">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="max-w-xl text-left font-regular text-3xl tracking-tighter md:text-5xl">
                  Latest Articles
                </h2>
                <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
                  Stay updated with our latest insights and stories.
                </p>
              </div>
            </div>
            <div className="text-center text-muted-foreground">
              <p>Unable to load articles at the moment. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};