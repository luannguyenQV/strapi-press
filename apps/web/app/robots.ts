/**
 * robots.txt - Next.js 15 Route Handler
 *
 * Provides crawl directives for search engine bots
 * Controls which paths are indexed and provides sitemap location
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API routes - no crawling
          '/admin/',         // Admin panel - no crawling
          '/_next/',         // Next.js internals
          '/private/',       // Private content (if any)
        ],
      },
      {
        // Specific rules for major search engines
        userAgent: ['Googlebot', 'Bingbot', 'Slurp'],
        allow: [
          '/',
          '/blog/',
          '/category/',
          '/author/',
          '/about',
          '/contact',
        ],
        crawlDelay: 0, // No delay for major search engines
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
