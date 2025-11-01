/**
 * RSS 2.0 Feed - Content Syndication
 *
 * Provides RSS feed for blog articles
 * Enables content distribution and third-party integrations
 *
 * @see https://www.rssboard.org/rss-specification
 */

import { cachedFind } from '@repo/strapi-client';
import type { Article } from '@repo/strapi-client';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
const SITE_NAME = 'StrapiPress';
const SITE_DESCRIPTION = 'Thoughts, ideas, and opinions from the StrapiPress team';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRssXml(articles: Article[]): string {
  const buildDate = new Date().toUTCString();

  const itemsXml = articles
    .map((article) => {
      const pubDate = new Date(article.publishedAt).toUTCString();
      const articleUrl = `${BASE_URL}/blog/${article.slug}`;
      const imageUrl = article.cover?.url
        ? `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}${article.cover.url}`
        : '';

      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      ${article.description ? `<description>${escapeXml(article.description)}</description>` : ''}
      ${article.author?.name ? `<author>noreply@${new URL(BASE_URL).hostname} (${escapeXml(article.author.name)})</author>` : ''}
      ${article.category?.name ? `<category>${escapeXml(article.category.name)}</category>` : ''}
      ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" />` : ''}
      ${article.content ? `<content:encoded><![CDATA[${article.content}]]></content:encoded>` : ''}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;
}

export async function GET() {
  try {
    // Fetch latest articles
    const response = await cachedFind('articles', {
      fields: ['title', 'slug', 'description', 'content', 'publishedAt'],
      populate: {
        author: {
          fields: ['name'],
        },
        category: {
          fields: ['name'],
        },
        cover: {
          fields: ['url', 'alternativeText'],
        },
      },
      sort: ['publishedAt:desc'],
      pagination: { pageSize: 50 }, // Last 50 articles
    }, {
      revalidate: 3600, // 1 hour cache
      tags: ['rss', 'articles', 'feed']
    });

    const articles = (response?.data as unknown as Article[]) || [];
    const rssXml = generateRssXml(articles);

    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('[RSS Feed] Error generating feed:', error);

    // Return error feed
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${BASE_URL}</link>
    <description>RSS feed temporarily unavailable</description>
  </channel>
</rss>`;

    return new Response(errorXml, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
}

// Enable edge runtime for faster RSS generation
export const runtime = 'edge';
