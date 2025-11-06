/**
 * XML Sitemap - Next.js 15 Route Handler
 *
 * Generates dynamic sitemap.xml for search engine discovery
 * Includes all articles, categories, authors, and static pages
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { cachedFind } from '@repo/strapi-client';
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all articles
    const articlesResponse = await cachedFind('articles', {
      fields: ['slug', 'updatedAt', 'publishedAt'],
      pagination: { pageSize: 1000 },
      sort: ['publishedAt:desc'],
    }, {
      revalidate: 3600, // 1 hour cache
      tags: ['sitemap', 'articles']
    });

    // Fetch all categories
    const categoriesResponse = await cachedFind('categories', {
      fields: ['slug', 'updatedAt'],
      pagination: { pageSize: 100 },
    }, {
      revalidate: false, // Build-time only - categories are static
      tags: ['sitemap', 'categories']
    });

    // Fetch all authors
    const authorsResponse = await cachedFind('authors', {
      fields: ['slug', 'updatedAt'],
      pagination: { pageSize: 100 },
    }, {
      revalidate: false, // Build-time only - authors are static
      tags: ['sitemap', 'authors']
    });

    const articles = articlesResponse?.data || [];
    const categories = categoriesResponse?.data || [];
    const authors = authorsResponse?.data || [];

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/authors`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.5,
      },
    ];

    // Article pages
    const articlePages: MetadataRoute.Sitemap = articles.map((article: any) => ({
      url: `${BASE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt || article.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((category: any) => ({
      url: `${BASE_URL}/category/${category.slug}`,
      lastModified: new Date(category.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // Author pages (when implemented)
    const authorPages: MetadataRoute.Sitemap = authors.map((author: any) => ({
      url: `${BASE_URL}/author/${author.slug}`,
      lastModified: new Date(author.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Combine all pages
    return [
      ...staticPages,
      ...articlePages,
      ...categoryPages,
      ...authorPages,
    ];
  } catch (error) {
    console.error('[Sitemap] Error generating sitemap:', error);

    // Fallback to basic sitemap on error
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ];
  }
}