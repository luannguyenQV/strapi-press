/**
 * Enhanced TypeScript types for Strapi v5 with TanStack Query integration
 *
 * Uses auto-generated Strapi types as the source of truth
 */

import type { Data, Schema, UID } from '@strapi/strapi';
import type {
  ApiArticleArticle,
  ApiAuthorAuthor,
  ApiCategoryCategory,
  ApiFooterFooter,
  ApiGlobalGlobal,
  PluginUploadFile,
} from '../../apps/strapi/types/generated/contentTypes';

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
 *
 * SINGLE SOURCE OF TRUTH: All types extracted from auto-generated ApiArticleArticle schema
 * Located at: apps/strapi/types/generated/contentTypes.d.ts
 *
 * When Strapi regenerates types, this automatically updates with no manual maintenance.
 */
type ArticleAttributes = ResolveAttributes<
  Omit<
    ApiArticleArticle['attributes'],
    | 'createdAt'
    | 'createdBy'
    | 'updatedAt'
    | 'updatedBy'
    | 'publishedAt'
    | 'locale'
    | 'localizations'
    | 'author' // Relation - goes in populated type
    | 'category' // Relation - goes in populated type
    | 'cover' // Media - goes in populated type
    | 'blocks' // DynamicZone - goes in populated type
  >
>;

export interface ArticleEntity extends StrapiBaseEntity, ArticleAttributes {}

/**
 * Author entity from Strapi schema
 *
 * SINGLE SOURCE OF TRUTH: All types extracted from auto-generated ApiAuthorAuthor schema
 * Located at: apps/strapi/types/generated/contentTypes.d.ts
 *
 * When Strapi regenerates types, this automatically updates with no manual maintenance.
 */
type AuthorAttributes = ResolveAttributes<
  Omit<
    ApiAuthorAuthor['attributes'],
    | 'createdAt'
    | 'createdBy'
    | 'updatedAt'
    | 'updatedBy'
    | 'publishedAt'
    | 'locale'
    | 'localizations'
    | 'articles' // Relation - goes in populated type
    | 'avatar' // Media - goes in populated type
  >
>;

export interface AuthorEntity extends StrapiBaseEntity, AuthorAttributes {}

/**
 * Category entity from Strapi schema
 *
 * SINGLE SOURCE OF TRUTH: All types extracted from auto-generated ApiCategoryCategory schema
 * Located at: apps/strapi/types/generated/contentTypes.d.ts
 *
 * When Strapi regenerates types, this automatically updates with no manual maintenance.
 */
type CategoryAttributes = ResolveAttributes<
  Omit<
    ApiCategoryCategory['attributes'],
    | 'createdAt'
    | 'createdBy'
    | 'updatedAt'
    | 'updatedBy'
    | 'publishedAt'
    | 'locale'
    | 'localizations'
    | 'articles' // Relation - goes in populated type
    | 'image' // Media - goes in populated type
  >
>;

export interface CategoryEntity extends StrapiBaseEntity, CategoryAttributes {}

/**
 * Global entity from Strapi schema
 *
 * SINGLE SOURCE OF TRUTH: All types extracted from auto-generated ApiGlobalGlobal schema
 * Located at: apps/strapi/types/generated/contentTypes.d.ts
 *
 * When Strapi regenerates types, this automatically updates with no manual maintenance.
 */
type GlobalAttributes = ResolveAttributes<
  Omit<
    ApiGlobalGlobal['attributes'],
    | 'createdAt'
    | 'createdBy'
    | 'updatedAt'
    | 'updatedBy'
    | 'publishedAt'
    | 'locale'
    | 'localizations'
    | 'favicon' // Media - goes in populated type
    | 'defaultSeo' // Component - goes in populated type
  >
>;

export interface GlobalEntity extends StrapiBaseEntity, GlobalAttributes {}

/**
 * Footer entity from Strapi schema
 *
 * SINGLE SOURCE OF TRUTH: All types extracted from auto-generated ApiFooterFooter schema
 * Located at: apps/strapi/types/generated/contentTypes.d.ts
 *
 * When Strapi regenerates types, this automatically updates with no manual maintenance.
 * Note: Even though locale/localizations are public in Footer, they must be excluded
 * to avoid conflict with StrapiBaseEntity which already provides them.
 */
type FooterAttributes = ResolveAttributes<
  Omit<
    ApiFooterFooter['attributes'],
    | 'createdAt'
    | 'createdBy'
    | 'updatedAt'
    | 'updatedBy'
    | 'publishedAt'
    | 'locale' // Must exclude to avoid conflict with StrapiBaseEntity
    | 'localizations' // Must exclude to avoid conflict with StrapiBaseEntity
    | 'socialLinks' // Component - goes in populated type
    | 'columns' // Component - goes in populated type
    | 'bottomLinks' // Component - goes in populated type
  >
>;

export interface FooterEntity extends StrapiBaseEntity, FooterAttributes {}

/**
 * Utility type: Resolves Schema.Attribute.* types to actual TypeScript types
 * This allows us to extract types from Strapi's auto-generated schemas
 */
type ResolveAttributes<
  TAttrs extends Record<string, Schema.Attribute.AnyAttribute>,
> = {
  [K in keyof TAttrs]: Schema.Attribute.Value<TAttrs[K]>;
};

/**
 * Media file entity from Strapi upload plugin
 *
 * SINGLE SOURCE OF TRUTH: All types extracted from auto-generated PluginUploadFile schema
 * Located at: apps/strapi/types/generated/contentTypes.d.ts
 *
 * When Strapi regenerates types, this automatically updates with no manual maintenance.
 *
 * Note: Data.ContentType<'plugin::upload.file'> only provides id/documentId (runtime entity),
 * so we extract the full attribute types from the schema definition instead.
 */
type MediaFileAttributes = ResolveAttributes<
  Omit<
    PluginUploadFile['attributes'],
    | 'createdAt'
    | 'createdBy'
    | 'updatedAt'
    | 'updatedBy'
    | 'publishedAt'
    | 'locale'
    | 'localizations'
  >
>;

export interface MediaFileEntity
  extends StrapiBaseEntity,
    MediaFileAttributes {}

// ========================================
// Populated Types (API Response Shapes)
// ========================================

/**
 * Article with populated relations (as returned by API)
 */
export type Article = ArticleEntity & {
  author?: AuthorEntity;
  category?: CategoryEntity;
  cover?: MediaFileEntity;
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
  avatar?: MediaFileEntity;
  articles?: ArticleEntity[];
};

/**
 * Category with populated relations (as returned by API)
 */
export type Category = CategoryEntity & {
  image?: MediaFileEntity;
  articles?: ArticleEntity[];
};

/**
 * Global settings with populated relations (as returned by API)
 */
export type Global = GlobalEntity & {
  favicon?: MediaFileEntity;
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
export const safeCastParams = (params: QueryParams): Record<string, unknown> =>
  params as unknown as Record<string, unknown>;

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
