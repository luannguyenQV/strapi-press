/**
 * Official Strapi client configuration with Next.js ISR caching
 * Uses @strapi/client for proper API integration with unstable_cache for persistent caching
 *
 * Cache Key Strategy:
 * - Uses fast-json-stable-stringify for deterministic cache key generation
 * - Ensures consistent cache keys regardless of object property ordering
 * - Example: {a:1, b:2} and {b:2, a:1} produce identical cache keys
 */

import { strapi } from '@strapi/client';
import stringify from 'fast-json-stable-stringify';
import { unstable_cache } from 'next/cache';
import type {
  QueryParams,
  StrapiResponse,
  StrapiSingleResponse,
} from './types';

// Create the official Strapi client instance
export const strapiClient = strapi({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337/api',
  ...(process.env.STRAPI_API_TOKEN && {
    token: process.env.STRAPI_API_TOKEN,
  }),
});

// Configuration object for environment settings
export const config = {
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  token: process.env.STRAPI_API_TOKEN,
};

// Cache options interface
export interface CacheOptions {
  revalidate?: number | false;
  tags?: string[];
}

/**
 * Cached collection find with Next.js ISR
 * Provides persistent caching across requests with automatic revalidation
 *
 * @param contentType - The Strapi content type to query
 * @param params - Query parameters (filters, sort, pagination, populate)
 * @param options - Cache configuration (revalidate time, tags)
 * @returns Promise resolving to Strapi collection response
 *
 * @example
 * ```typescript
 * const articles = await cachedFind('articles',
 *   { filters: { featured: true } },
 *   { revalidate: 300, tags: ['articles', 'featured'] }
 * );
 * ```
 */
export const cachedFind = async <T extends object = Record<string, unknown>>(
  contentType: string,
  params?: QueryParams,
  options?: CacheOptions
): Promise<StrapiResponse<T>> => {
  const cachedFn = unstable_cache(
    async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache MISS] Fetching ${contentType}`, params);
      }
      return strapiClient
        .collection(contentType)
        .find(params) as unknown as Promise<StrapiResponse<T>>;
    },
    ['strapi', contentType, stringify(params || {})],
    {
      revalidate: options?.revalidate ?? 300, // Default 5 minutes
      tags: options?.tags ?? [contentType, 'strapi', `${contentType}-list`],
    }
  );

  return cachedFn();
};

/**
 * Cached single document find with Next.js ISR
 * Provides persistent caching for individual documents
 *
 * @param contentType - The Strapi content type to query
 * @param id - Document ID or slug
 * @param params - Query parameters (populate, fields)
 * @param options - Cache configuration (revalidate time, tags)
 * @returns Promise resolving to single Strapi document response
 *
 * @example
 * ```typescript
 * const article = await cachedFindOne('articles', 'my-article-slug',
 *   { populate: { author: true, category: true } },
 *   { revalidate: 600, tags: ['article', 'article-my-article-slug'] }
 * );
 * ```
 */
export const cachedFindOne = async <T extends object = Record<string, unknown>>(
  contentType: string,
  id: string | number,
  params?: QueryParams,
  options?: CacheOptions
): Promise<StrapiSingleResponse<T>> => {
  const cachedFn = unstable_cache(
    async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache MISS] Fetching ${contentType}/${id}`, params);
      }
      return strapiClient
        .collection(contentType)
        .findOne(String(id), params) as unknown as Promise<
        StrapiSingleResponse<T>
      >;
    },
    ['strapi', contentType, String(id), stringify(params || {})],
    {
      revalidate: options?.revalidate ?? 600, // Default 10 minutes for single documents
      tags: options?.tags ?? [contentType, 'strapi', `${contentType}-${id}`],
    }
  );

  return cachedFn();
};

/**
 * Cached single type find with Next.js ISR
 * For singleton content types like footer, global settings, etc.
 *
 * @param contentType - The Strapi single type to query
 * @param params - Query parameters (populate, fields)
 * @param options - Cache configuration (revalidate time, tags)
 * @returns Promise resolving to single Strapi document response
 *
 * @example
 * ```typescript
 * const footer = await cachedFindSingleType('footer',
 *   { populate: { logo: true, socialLinks: true } },
 *   { revalidate: 1800, tags: ['footer', 'global'] }
 * );
 * ```
 */
export const cachedFindSingleType = async <
  T extends object = Record<string, unknown>,
>(
  contentType: string,
  params?: QueryParams,
  options?: CacheOptions
): Promise<StrapiSingleResponse<T>> => {
  const cachedFn = unstable_cache(
    async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache MISS] Fetching single type ${contentType}`, params);
      }
      return strapiClient
        .collection(contentType)
        .find(params) as unknown as Promise<StrapiSingleResponse<T>>;
    },
    ['strapi-single', contentType, stringify(params || {})],
    {
      revalidate: options?.revalidate ?? 1800, // Default 30 minutes for single types (rarely change)
      tags: options?.tags ?? [contentType, 'strapi', 'single-type'],
    }
  );

  return cachedFn();
};

// Export the client as default for backward compatibility
export default strapiClient;
