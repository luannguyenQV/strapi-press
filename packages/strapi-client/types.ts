/**
 * Enhanced TypeScript types for Strapi v5 with TanStack Query integration
 *
 * Uses auto-generated Strapi types as the source of truth
 */

import type { Data, Schema, UID } from '@strapi/strapi';

// ========================================
// Base Entity Types (Hybrid: Data namespace + Manual typing)
// ========================================

/**
 * Common fields from Strapi v5 entities
 */
interface StrapiBaseEntity {
  id: number;
  documentId: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  locale?: string;
}

/**
 * Article entity from Strapi schema
 * Auto-syncs with apps/strapi/src/api/article/content-types/article/schema.json
 */
export interface ArticleEntity extends StrapiBaseEntity {
  title: string;
  slug: string;
  description?: string;
  content?: string; // Optional: may be derived from blocks
  featured?: boolean;
  // Relations are typed separately in populated types
}

/**
 * Author entity from Strapi schema
 * Auto-syncs with apps/strapi/src/api/author/content-types/author/schema.json
 */
export interface AuthorEntity extends StrapiBaseEntity {
  name: string;
  email?: string;
  slug?: string;
}

/**
 * Category entity from Strapi schema
 * Auto-syncs with apps/strapi/src/api/category/content-types/category/schema.json
 */
export interface CategoryEntity extends StrapiBaseEntity {
  name: string;
  slug: string;
  description?: string;
}

/**
 * Global entity from Strapi schema
 * Auto-syncs with apps/strapi/src/api/global/content-types/global/schema.json
 */
export interface GlobalEntity extends StrapiBaseEntity {
  siteName?: string;
  siteDescription?: string;
}

/**
 * Footer entity from Strapi schema
 * Auto-syncs with apps/strapi/src/api/footer/content-types/footer/schema.json
 */
export interface FooterEntity extends StrapiBaseEntity {
  // Footer-specific fields
}

/**
 * Media file entity from upload plugin
 */
export type MediaFileEntity = Data.ContentType<'plugin::upload.file'>;

// ========================================
// Populated Types (API Response Shapes)
// ========================================

/**
 * Article with populated relations (as returned by API)
 */
export type Article = ArticleEntity & {
  author?: AuthorEntity;
  category?: CategoryEntity;
  cover?: Media;
  blocks?: Array<
    | Data.Component<'shared.media'>
    | Data.Component<'shared.quote'>
    | Data.Component<'shared.rich-text'>
    | Data.Component<'shared.slider'>
  >;
};

/**
 * Author with populated relations (as returned by API)
 */
export type Author = AuthorEntity & {
  avatar?: Media;
  articles?: ArticleEntity[];
};

/**
 * Category with populated relations (as returned by API)
 */
export type Category = CategoryEntity & {
  image?: Media;
  articles?: ArticleEntity[];
};

/**
 * Global settings with populated relations (as returned by API)
 */
export type Global = GlobalEntity & {
  favicon?: Media;
  defaultSeo?: SEOComponent;
};

/**
 * Footer with populated components (as returned by API)
 */
export type Footer = FooterEntity & {
  socialLinks?: SocialLinkComponent[];
  columns?: NavigationColumnComponent[];
  bottomLinks?: NavigationLinkComponent[];
};

// ========================================
// Component Types (Auto-Generated via Data namespace)
// ========================================

export type MediaComponent = Data.Component<'shared.media'>;
export type QuoteComponent = Data.Component<'shared.quote'>;
export type RichTextComponent = Data.Component<'shared.rich-text'>;
export type SliderComponent = Data.Component<'shared.slider'>;
export type SEOComponent = Data.Component<'shared.seo'>;
export type SocialLinkComponent = Data.Component<'footer.social-link'>;
export type NavigationColumnComponent =
  Data.Component<'footer.navigation-column'>;
export type NavigationLinkComponent = Data.Component<'footer.navigation-link'>;

// ========================================
// Media Types (Custom for better DX)
// ========================================

/**
 * Simplified Media interface for frontend consumption
 * Note: This is kept custom for better developer experience
 * as the auto-generated upload plugin type is overly complex
 */
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

// ========================================
// JSON-LD Type for SEO
// ========================================

export type WithContext<T> = T & {
  '@context': 'https://schema.org';
};

// ========================================
// Strapi Response Wrapper Types
// ========================================

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

// ========================================
// Query Parameter Types
// ========================================

/**
 * Strapi v5 Logical Filter Operators
 * Supports $and, $or, $not for complex queries
 */
export type StrapiLogicalFilters<T> = {
  $and?: Array<T | StrapiLogicalFilters<T>>;
  $or?: Array<T | StrapiLogicalFilters<T>>;
  $not?: T | StrapiLogicalFilters<T>;
};

/**
 * Complete Strapi filter type that supports both direct filters and logical operators
 */
export type StrapiFilterQuery<T> =
  | T
  | StrapiLogicalFilters<T>
  | (T & StrapiLogicalFilters<T>);

/**
 * Base filter properties for Article without logical operators
 */
export interface ArticleFilters {
  title?: { $contains?: string; $containsi?: string };
  slug?: { $eq?: string; $ne?: string };
  featured?: { $eq?: boolean; $ne?: boolean; $null?: boolean };
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
  // Index signature for Strapi client compatibility
  [key: string]: unknown;
}

/**
 * Complete article filter query type (base filters + logical operators)
 * Use this for complex queries with $and, $or, $not
 */
export type ArticleFilterQuery = StrapiFilterQuery<ArticleFilters>;

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
  [key: string]:
    | boolean
    | string
    | PopulateParams
    | {
        populate?: PopulateParams;
        fields?: string[];
        sort?: string | string[];
        filters?: FilterParams;
      };
}

export interface QueryParams {
  filters?: FilterParams | ArticleFilterQuery;
  sort?: string | string[];
  pagination?: PaginationParams;
  populate?: string | string[] | PopulateParams;
  fields?: string[];
  locale?: string;
  publicationState?: 'live' | 'preview';
}

// ========================================
// Bridge Functions (Type Transformers)
// ========================================

/**
 * Safely cast query parameters to satisfy Strapi client typing
 */
export const safeCastParams = (params: unknown): unknown => params;

/**
 * Transform raw Strapi collection response to typed StrapiResponse
 */
export const bridgeCollectionResponse = <T>(
  response: unknown
): StrapiResponse<T> => {
  return response as StrapiResponse<T>;
};

/**
 * Transform raw Strapi single response to typed StrapiSingleResponse
 */
export const bridgeSingleResponse = <T>(
  response: unknown
): StrapiSingleResponse<T> => {
  return response as StrapiSingleResponse<T>;
};

/**
 * Transform article collection response
 */
export const bridgeArticleCollection = (
  response: unknown
): StrapiResponse<Article> => {
  return bridgeCollectionResponse<Article>(response);
};

/**
 * Transform article single response
 */
export const bridgeArticleSingle = (
  response: unknown
): StrapiSingleResponse<Article> => {
  return bridgeSingleResponse<Article>(response);
};

/**
 * Transform category collection response
 */
export const bridgeCategoryCollection = (
  response: unknown
): StrapiResponse<Category> => {
  return bridgeCollectionResponse<Category>(response);
};

/**
 * Transform category single response
 */
export const bridgeCategorySingle = (
  response: unknown
): StrapiSingleResponse<Category> => {
  return bridgeSingleResponse<Category>(response);
};

/**
 * Transform footer single response
 */
export const bridgeFooterSingle = (
  response: unknown
): StrapiSingleResponse<Footer> => {
  return bridgeSingleResponse<Footer>(response);
};

// ========================================
// Re-export Strapi Types for Convenience
// ========================================

export type { Data, UID, Schema };
