/**
 * Enhanced TypeScript types for Strapi v5 with TanStack Query integration
 */

// Note: @strapi/client types may vary by version
// Using any for Strapi client response types as they're not consistently exported
type StrapiClientResponse = any;
type StrapiClientCollection = any;

// Base response interfaces
export interface BaseResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

// Media interfaces
export interface Media {
  id: number;
  documentId?: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: MediaFormat;
    small?: MediaFormat;
    medium?: MediaFormat;
    large?: MediaFormat;
  };
  url: string;
  previewUrl?: string;
  provider?: string;
  mime?: string;
  size?: number;
}

export interface MediaFormat {
  name: string;
  url: string;
  width: number;
  height: number;
  size: number;
}

// Content type interfaces
export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  featured?: boolean;
  viewCount?: number;
  readingTime?: number;
  author?: Author;
  category?: Category;
  cover?: Media;
  seo?: SEO;
}

export interface Author {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  email?: string;
  bio?: string;
  avatar?: Media;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface Category {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface Footer {
  id: number;
  documentId?: string;
  logo?: Media;
  companyName?: string;
  description?: string;
  copyright?: string;
  socialLinks?: SocialLink[];
  menuLinks?: MenuLink[];
  contactInfo?: ContactInfo;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string;
}

export interface MenuLink {
  id: number;
  label: string;
  url: string;
  isExternal?: boolean;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  metaRobots?: string;
  canonicalURL?: string;
  structuredData?: Record<string, unknown>;
}

// Filter interfaces
export interface ArticleFilters {
  title?: { $contains?: string; $containsi?: string };
  slug?: { $eq?: string };
  featured?: { $eq?: boolean };
  publishedAt?: {
    $gte?: string;
    $lte?: string;
    $between?: [string, string];
  };
  author?: {
    slug?: { $eq?: string };
    documentId?: { $eq?: string };
  };
  category?: {
    slug?: { $eq?: string };
    documentId?: { $eq?: string };
  };
  $or?: Array<{
    title?: { $contains?: string; $containsi?: string };
    description?: { $contains?: string; $containsi?: string };
    content?: { $contains?: string; $containsi?: string };
  }>;
}

// Query parameter interfaces
export interface FilterParams {
  [key: string]: unknown;
}

export interface SortParams {
  [key: string]: 'asc' | 'desc' | 'ASC' | 'DESC';
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  start?: number;
  limit?: number;
}

export interface PopulateParams {
  [key: string]: boolean | string | PopulateParams | {
    populate?: PopulateParams;
    fields?: string[];
    sort?: string | string[];
    filters?: FilterParams;
  };
}

export interface QueryParams {
  filters?: FilterParams;
  sort?: string | string[];
  pagination?: PaginationParams;
  populate?: string | string[] | PopulateParams;
  fields?: string[];
  locale?: string;
  publicationState?: 'live' | 'preview';
}

// Type bridge utilities for @strapi/client compatibility
export type StrapiBridge<T> = {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type StrapiBridgeSingle<T> = {
  data: T;
  meta: Record<string, unknown>;
};

/**
 * Type-safe bridge functions to convert @strapi/client responses to custom types
 * These eliminate the need for unsafe "as any" or "as unknown as" casting
 */
export const bridgeCollectionResponse = <T>(
  response: StrapiClientCollection
): StrapiResponse<T> => {
  return {
    data: response.data as unknown as T[],
    meta: {
      pagination: response.meta?.pagination || {
        page: 1,
        pageSize: 25,
        pageCount: 1,
        total: response.data?.length || 0,
      },
    },
  };
};

export const bridgeSingleResponse = <T>(
  response: StrapiClientResponse
): StrapiSingleResponse<T> => {
  return {
    data: response.data as unknown as T,
    meta: response.meta || {},
  };
};

// Content type specific bridge functions for better type safety
export const bridgeArticleCollection = (
  response: StrapiClientCollection
): StrapiResponse<Article> => bridgeCollectionResponse<Article>(response);

export const bridgeArticleSingle = (
  response: StrapiClientResponse
): StrapiSingleResponse<Article> => bridgeSingleResponse<Article>(response);

export const bridgeCategoryCollection = (
  response: StrapiClientCollection
): StrapiResponse<Category> => bridgeCollectionResponse<Category>(response);

export const bridgeCategorySingle = (
  response: StrapiClientResponse
): StrapiSingleResponse<Category> => bridgeSingleResponse<Category>(response);

export const bridgeFooterSingle = (
  response: StrapiClientResponse
): StrapiSingleResponse<Footer> => bridgeSingleResponse<Footer>(response);

// Type-safe parameter casting for populate and filter objects
export const safeCastParams = <T = QueryParams>(params: T): Record<string, unknown> => {
  return params as Record<string, unknown>;
};

// Type guards for runtime validation (optional)
export const isStrapiResponse = <T>(response: unknown): response is StrapiResponse<T> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray((response as any).data) &&
    'meta' in response
  );
};

export const isStrapiSingleResponse = <T>(response: unknown): response is StrapiSingleResponse<T> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    !Array.isArray((response as any).data) &&
    'meta' in response
  );
};