import fs from 'node:fs';
import { env } from '@/env';
import { strapi } from '@repo/strapi-client';
import type { MetadataRoute } from 'next';

const appFolders = fs.readdirSync('app', { withFileTypes: true });
const pages = appFolders
  .filter((file) => file.isDirectory())
  .filter((folder) => !folder.name.startsWith('_'))
  .filter((folder) => !folder.name.startsWith('('))
  .map((folder) => folder.name);

// Get blog posts from Strapi
const blogPosts = await strapi.find('articles', {
  fields: ['slug'],
  publicationState: 'live',
});

// Get legal pages from Strapi (if applicable)
const legalPages: any[] = []; // Placeholder - implement if needed

const protocol = env.VERCEL_PROJECT_PRODUCTION_URL?.startsWith('https')
  ? 'https'
  : 'http';
const url = new URL(`${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`);

const sitemap = async (): Promise<MetadataRoute.Sitemap> => [
  {
    url: new URL('/', url).href,
    lastModified: new Date(),
  },
  ...pages.map((page) => ({
    url: new URL(page, url).href,
    lastModified: new Date(),
  })),
  ...blogPosts.data.map((post: any) => ({
    url: new URL(`blog/${post.slug}`, url).href,
    lastModified: new Date(),
  })),
  ...legalPages.map((legal: any) => ({
    url: new URL(`legal/${legal.slug}`, url).href,
    lastModified: new Date(),
  })),
];

export default sitemap;
