import {
  type ValidatedArticle,
  cachedFind,
  safeCastParams,
  validateArticle,
} from '@repo/strapi-client';
import { cache } from 'react';

/**
 * Shared article fetching function with React cache() deduplication
 * Ensures the same article is only fetched once per render,
 * even when called from both generateMetadata() and page component
 */
export const getArticleBySlug = cache(
  async (slug: string): Promise<ValidatedArticle | null> => {
    try {
      const response = await cachedFind(
        'articles',
        safeCastParams({
          filters: { slug: { $eq: slug } },
          populate: {
            cover: {
              fields: ['url', 'alternativeText', 'width', 'height'],
            },
            author: {
              fields: ['name', 'email'],
              populate: {
                avatar: {
                  fields: ['url', 'alternativeText'],
                },
              },
            },
            category: {
              fields: ['name', 'slug'],
            },
            blocks: {
              populate: '*',
            },
          },
        }),
        {
          revalidate: 300, // 5 minutes ISR
          tags: ['articles', `article-${slug}`],
        }
      );

      const rawArticle = response?.data?.[0];
      if (!rawArticle) {
        return null;
      }

      // Validate article data with Zod
      return validateArticle(rawArticle);
    } catch (error) {
      console.error(`Error fetching article with slug "${slug}":`, error);
      return null;
    }
  }
);
