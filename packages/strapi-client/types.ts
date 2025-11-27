/**
 * Type-safe Strapi client types with minimal duplication
 *
 * Design principles (inspired by Zod):
 * 1. Single source of truth - derive all types from Strapi schemas
 * 2. Composable utilities - reusable type transformers
 * 3. DRY - no repeated type definitions
 */

import type { Data, Schema, UID } from '@strapi/strapi';
import type {
  ApiArticleArticle,
  ApiBookmarkBookmark,
  ApiCategoryCategory,
  ApiCommentComment,
  ApiFollowFollow,
  ApiFooterFooter,
  ApiGlobalGlobal,
  ApiLikeLike,
  ApiTagTag,
  PluginUsersPermissionsUser,
} from '../../apps/strapi/types/generated/contentTypes';

// ============================================================================
// UTILITY TYPES - Reusable type transformers (like Zod's z.infer)
// ============================================================================

/**
 * Common Strapi system fields present on all entities
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
 * Fields automatically managed by Strapi - always exclude from attribute extraction
 */
type StrapiSystemFields =
  | 'createdAt'
  | 'createdBy'
  | 'updatedAt'
  | 'updatedBy'
  | 'publishedAt'
  | 'locale'
  | 'localizations';

/**
 * Resolves Strapi schema attributes to TypeScript types
 * This is the core utility that transforms Strapi's complex schema types
 */
type ResolveAttributes<T extends Record<string, Schema.Attribute.AnyAttribute>> = {
  [K in keyof T]: Schema.Attribute.Value<T[K]>;
};

/**
 * Extracts entity attributes from a Strapi content type, excluding system fields
 * and any additional fields (relations, media) that should be in populated type
 *
 * @example
 * type ArticleAttrs = ExtractAttributes<ApiArticleArticle, 'author' | 'cover'>;
 */
type ExtractAttributes<
  TContentType extends { attributes: Record<string, Schema.Attribute.AnyAttribute> },
  TExclude extends string = never,
> = ResolveAttributes<Omit<TContentType['attributes'], StrapiSystemFields | TExclude>>;

/**
 * Creates an entity type from Strapi content type
 * Combines base entity fields with extracted attributes
 */
type CreateEntity<
  TContentType extends { attributes: Record<string, Schema.Attribute.AnyAttribute> },
  TExclude extends string = never,
> = StrapiBaseEntity & ExtractAttributes<TContentType, TExclude>;

// ============================================================================
// MEDIA TYPE
// ============================================================================

/**
 * Media file entity - simplified for API responses
 * Explicit interface because upload plugin schema differs from API response
 */
export interface MediaFileEntity extends StrapiBaseEntity {
  url: string;
  name?: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, unknown> | null;
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  previewUrl?: string | null;
  provider?: string;
  provider_metadata?: Record<string, unknown> | null;
}

// ============================================================================
// USER ENTITY (users-permissions plugin)
// ============================================================================

/** Fields to exclude from User (private + relations) */
type UserExcludedFields =
  | 'password'
  | 'resetPasswordToken'
  | 'confirmationToken'
  | 'role'
  | 'avatar'
  | 'articles'
  | 'comments'
  | 'likes'
  | 'bookmarks'
  | 'followers'
  | 'following';

export type UserEntity = CreateEntity<PluginUsersPermissionsUser, UserExcludedFields>;

export type User = UserEntity & {
  avatar?: MediaFileEntity;
  articles?: ArticleEntity[];
  comments?: CommentEntity[];
  likes?: LikeEntity[];
  bookmarks?: BookmarkEntity[];
  followers?: FollowEntity[];
  following?: FollowEntity[];
};

/** Simplified user for embedding (author references) */
export interface UserInfo {
  id: number;
  documentId?: string;
  username?: string;
  name?: string;
  displayName?: string;
  slug?: string;
  email?: string | null;
  bio?: string;
  avatar?: MediaFileEntity;
}

/** @deprecated Use UserInfo instead */
export type Author = UserInfo;

// ============================================================================
// ARTICLE ENTITY
// ============================================================================

type ArticleExcludedFields = 'author' | 'category' | 'cover' | 'blocks' | 'tags' | 'comments' | 'likes' | 'bookmarks';

export type ArticleEntity = CreateEntity<ApiArticleArticle, ArticleExcludedFields>;

export type Article = ArticleEntity & {
  author?: UserInfo;
  category?: CategoryEntity;
  cover?: MediaFileEntity;
  tags?: TagEntity[];
  blocks?: Array<
    | Data.Component<'shared.media'>
    | Data.Component<'shared.quote'>
    | Data.Component<'shared.rich-text'>
    | Data.Component<'shared.slider'>
  >;
  comments?: CommentEntity[];
  likes?: LikeEntity[];
  bookmarks?: BookmarkEntity[];
};

// ============================================================================
// CATEGORY ENTITY
// ============================================================================

type CategoryExcludedFields = 'articles' | 'image';

export type CategoryEntity = CreateEntity<ApiCategoryCategory, CategoryExcludedFields>;

export type Category = CategoryEntity & {
  image?: MediaFileEntity;
  articles?: ArticleEntity[];
};

// ============================================================================
// TAG ENTITY
// ============================================================================

type TagExcludedFields = 'articles';

export type TagEntity = CreateEntity<ApiTagTag, TagExcludedFields>;

export type Tag = TagEntity & {
  articles?: ArticleEntity[];
};

// ============================================================================
// COMMENT ENTITY
// ============================================================================

type CommentExcludedFields = 'user' | 'article';

export type CommentEntity = CreateEntity<ApiCommentComment, CommentExcludedFields>;

export type Comment = CommentEntity & {
  user?: UserInfo;
  article?: ArticleEntity;
};

// ============================================================================
// LIKE ENTITY
// ============================================================================

type LikeExcludedFields = 'user' | 'article';

export type LikeEntity = CreateEntity<ApiLikeLike, LikeExcludedFields>;

export type Like = LikeEntity & {
  user?: UserInfo;
  article?: ArticleEntity;
};

// ============================================================================
// BOOKMARK ENTITY
// ============================================================================

type BookmarkExcludedFields = 'user' | 'article';

export type BookmarkEntity = CreateEntity<ApiBookmarkBookmark, BookmarkExcludedFields>;

export type Bookmark = BookmarkEntity & {
  user?: UserInfo;
  article?: ArticleEntity;
};

// ============================================================================
// FOLLOW ENTITY
// ============================================================================

type FollowExcludedFields = 'follower' | 'following';

export type FollowEntity = CreateEntity<ApiFollowFollow, FollowExcludedFields>;

export type Follow = FollowEntity & {
  follower?: UserInfo;
  following?: UserInfo;
};

// ============================================================================
// GLOBAL ENTITY (Singleton)
// ============================================================================

type GlobalExcludedFields = 'favicon' | 'defaultSeo';

export type GlobalEntity = CreateEntity<ApiGlobalGlobal, GlobalExcludedFields>;

export type Global = GlobalEntity & {
  favicon?: MediaFileEntity;
  defaultSeo?: SEOComponent;
};

// ============================================================================
// FOOTER ENTITY (Singleton)
// ============================================================================

type FooterExcludedFields = 'socialLinks' | 'columns' | 'bottomLinks';

export type FooterEntity = CreateEntity<ApiFooterFooter, FooterExcludedFields>;

export type Footer = FooterEntity & {
  socialLinks?: SocialLinkComponent[];
  columns?: NavigationColumnComponent[];
  bottomLinks?: NavigationLinkComponent[];
};

// ============================================================================
// COMPONENT TYPES
// ============================================================================

export type MediaComponent = Data.Component<'shared.media'>;
export type QuoteComponent = Data.Component<'shared.quote'>;
export type RichTextComponent = Data.Component<'shared.rich-text'>;
export type SliderComponent = Data.Component<'shared.slider'>;
export type SEOComponent = Data.Component<'shared.seo'>;
export type SocialLinkComponent = Data.Component<'footer.social-link'>;
export type NavigationColumnComponent = Data.Component<'footer.navigation-column'>;
export type NavigationLinkComponent = Data.Component<'footer.navigation-link'>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: StrapiPagination;
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

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

/** Strapi filter operators */
export interface FilterOperators<T> {
  $eq?: T;
  $ne?: T;
  $lt?: T;
  $lte?: T;
  $gt?: T;
  $gte?: T;
  $in?: T[];
  $notIn?: T[];
  $contains?: string;
  $containsi?: string;
  $notContains?: string;
  $notContainsi?: string;
  $startsWith?: string;
  $endsWith?: string;
  $null?: boolean;
  $notNull?: boolean;
  $between?: [T, T];
}

/** Logical operators for complex queries */
export interface LogicalOperators<T> {
  $and?: Array<T | LogicalOperators<T>>;
  $or?: Array<T | LogicalOperators<T>>;
  $not?: T | LogicalOperators<T>;
  [key: string]: Array<T | LogicalOperators<T>> | T | LogicalOperators<T> | undefined;
}

/** Article-specific filter fields */
export interface ArticleFilters {
  title?: FilterOperators<string>;
  slug?: FilterOperators<string>;
  featured?: FilterOperators<boolean>;
  publishedAt?: FilterOperators<string>;
  author?: {
    id?: FilterOperators<number>;
    username?: FilterOperators<string>;
    slug?: FilterOperators<string>;
    documentId?: FilterOperators<string>;
  };
  category?: {
    slug?: FilterOperators<string>;
    documentId?: FilterOperators<string>;
  };
  tags?: {
    slug?: FilterOperators<string>;
    documentId?: FilterOperators<string>;
  };
  [key: string]: unknown;
}

export type ArticleFilterQuery = ArticleFilters | LogicalOperators<ArticleFilters>;

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
    | string[]
    | PopulateParams
    | {
        populate?: PopulateParams | string | string[];
        fields?: string[];
        sort?: string | string[];
        filters?: Record<string, unknown>;
      };
}

export interface QueryParams {
  filters?: Record<string, unknown> | ArticleFilterQuery;
  sort?: string | string[];
  pagination?: PaginationParams;
  populate?: string | string[] | PopulateParams;
  fields?: string[];
  locale?: string;
  publicationState?: 'live' | 'preview';
}

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/** Type guard for StrapiResponse */
export const isStrapiResponse = <T>(value: unknown): value is StrapiResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    Array.isArray((value as StrapiResponse<T>).data) &&
    'meta' in value
  );
};

/** Type guard for StrapiSingleResponse */
export const isStrapiSingleResponse = <T>(value: unknown): value is StrapiSingleResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    !Array.isArray((value as StrapiSingleResponse<T>).data) &&
    'meta' in value
  );
};

/** Cast params for Strapi client compatibility */
export const safeCastParams = (params?: QueryParams): Record<string, unknown> =>
  (params ?? {}) as Record<string, unknown>;

/**
 * Bridge collection response with optional runtime validation
 * @param response - Raw API response
 * @param validate - Optional Zod schema for runtime validation
 */
export const bridgeCollectionResponse = <T>(
  response: unknown,
  validate?: (data: unknown) => T[]
): StrapiResponse<T> => {
  if (!isStrapiResponse<T>(response)) {
    throw new Error('Invalid collection response structure');
  }
  if (validate) {
    return {
      ...response,
      data: validate(response.data),
    };
  }
  return response as StrapiResponse<T>;
};

/**
 * Bridge single response with optional runtime validation
 * @param response - Raw API response
 * @param validate - Optional Zod schema for runtime validation
 */
export const bridgeSingleResponse = <T>(
  response: unknown,
  validate?: (data: unknown) => T
): StrapiSingleResponse<T> => {
  if (!isStrapiSingleResponse<T>(response)) {
    throw new Error('Invalid single response structure');
  }
  if (validate) {
    return {
      ...response,
      data: validate(response.data),
    };
  }
  return response as StrapiSingleResponse<T>;
};

// ============================================================================
// JSON-LD TYPE
// ============================================================================

export type WithContext<T> = T & {
  '@context': 'https://schema.org';
};

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type { Data, UID, Schema };
