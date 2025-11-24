import { cache } from 'react';
import {
  cachedFind,
  validateArticle,
  safeCastParams,
  type ValidatedArticle,
} from '@repo/strapi-client';

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
            on: {
              'shared.media': {
                populate: {
                  file: {
                    fields: ['url', 'alternativeText', 'width', 'height'],
                  },
                },
              },
              'shared.quote': {
                populate: ['author'],
              },
              'shared.rich-text': {
                populate: ['body'],
              },
              'shared.slider': {
                populate: {
                  files: {
                    fields: ['url', 'alternativeText', 'width', 'height'],
                  },
                },
              },
            },
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
    const validatedArticle = validateArticle(rawArticle);
    return validatedArticle;
  } catch (error) {
    console.error(`Error fetching article with slug "${slug}":`, error);
    return null;
  }
});
