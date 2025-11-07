
import type { Dictionary } from '@repo/internationalization';
import { type Article, type ArticleFilterQuery, DEFAULT_PAGE_SIZE, cachedFind } from '@repo/strapi-client';
import { ArticleListItem, InfinityArticles, } from '.';
import { NoResult } from '../no-result';

type ArticlesProps = {
  dictionary: Dictionary;
  /** Sort order for publishedAt field */
  sortBy?: 'asc' | 'desc';
  /** Filter by author slug or id */
  authorSlug?: string;
  /** Filter by category slug or id */
  categorySlug?: string;
  /** Filter by featured status: true (only featured), false (only non-featured), undefined (all) */
  featured?: boolean;
  /** Search query for title (case-insensitive) */
  searchQuery?: string;
};

export const Articles = async ({
  sortBy = 'desc',
  authorSlug,
  categorySlug,
  featured,
  searchQuery,
}: ArticlesProps) => {
  try {
    // Build filters array for $and operator
    const filterConditions: ArticleFilterQuery[] = [];

    // Add search filter if provided
    if (searchQuery && searchQuery.trim().length > 0) {
      filterConditions.push({
        title: { $containsi: searchQuery.trim() }
      });
    }

    // Add featured filter if provided
    if (featured !== undefined) {
      if (featured === true) {
        // Only show featured articles
        filterConditions.push({
          featured: { $eq: true }
        });
      } else {
        // Only show non-featured articles (featured = false OR null)
        filterConditions.push({
          $or: [
            { featured: { $eq: false } },
            { featured: { $null: true } }
          ]
        });
      }
    }

    // Add author filter if provided
    if (authorSlug) {
      filterConditions.push({
        author: { slug: { $eq: authorSlug } }
      });
    }

    // Add category filter if provided
    if (categorySlug) {
      filterConditions.push({
        category: { slug: { $eq: categorySlug } }
      });
    }

    // Build final filter object
    const filters: ArticleFilterQuery = filterConditions.length > 0
      ? { $and: filterConditions }
      : {};

    // Fetch articles from Strapi with Next.js ISR caching
    const response = await cachedFind<Article>('articles', {
      filters,
      sort: [`publishedAt:${sortBy}`],
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
    const articles = response?.data

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

          <InfinityArticles
            pageSize={DEFAULT_PAGE_SIZE}
            sortBy={sortBy}
            authorSlug={authorSlug}
            categorySlug={categorySlug}
            featured={featured}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    );
  } catch {
    return (
      <NoResult message="No articles found!" />
    );
  }
};