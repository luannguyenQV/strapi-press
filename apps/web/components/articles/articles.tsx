import type { Dictionary } from '@repo/internationalization';
import { type Article, DEFAULT_PAGE_SIZE, cachedFind } from '@repo/strapi-client';
import { ArticleListItem, LoadMoreArticles, NoArticle } from '.';

type ArticlesProps = {
  dictionary: Dictionary;
};

export const Articles = async (props: ArticlesProps) => {
  try {
    // Fetch articles from Strapi with Next.js ISR caching
    const response = await cachedFind('articles', {
      // Filter for non-featured articles (featured = false OR null)
      // Note: If you want ALL articles, remove the filters line
      filters: {
        $or: [
          { featured: { $eq: false } },
          { featured: { $null: true } }
        ]
      },
      sort: ['publishedAt:desc'],
      pagination: { pageSize: DEFAULT_PAGE_SIZE },
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
      <div className='w-full max-w-4xl'>
        <div className="flex flex-col">
          {/* Initial articles (Page 1) - Server-rendered with ISR cache */}
          <div className="space-y-8">
            {articles.map((article: Article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>

          {/* Load More articles (Page 2+) - Client-side with TanStack Query */}
          <LoadMoreArticles pageSize={DEFAULT_PAGE_SIZE} />
        </div>
      </div>
    );
  } catch {
    return (
      <NoArticle />
    );
  }
};