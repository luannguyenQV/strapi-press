/**
 * Official Strapi client configuration
 * Uses @strapi/client for proper API integration
 */

import { strapi } from '@strapi/client';
import { cache } from 'react';
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

// React Server Component cache wrappers for services
export const cachedFind = cache(
  <T extends object = Record<string, unknown>>(
    contentType: string,
    params?: QueryParams
  ): Promise<StrapiResponse<T>> =>
    // Cast to avoid exporting non-portable types from @strapi/client
    strapiClient.collection(contentType).find(params) as unknown as Promise<
      StrapiResponse<T>
    >
);

const _cachedFindOneImpl = <T extends object = Record<string, unknown>>(
  contentType: string,
  id: string | number,
  params?: QueryParams
): Promise<StrapiSingleResponse<T>> =>
  // Cast to avoid exporting non-portable types from @strapi/client
  strapiClient
    .collection(contentType)
    .findOne(String(id), params) as unknown as Promise<StrapiSingleResponse<T>>;

export const cachedFindOne = cache(_cachedFindOneImpl) as unknown as <
  T extends object = Record<string, unknown>,
>(
  contentType: string,
  id: string | number,
  params?: QueryParams
) => Promise<StrapiSingleResponse<T>>;

// Export the client as default for backward compatibility
export default strapiClient;
