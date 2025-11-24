import { z } from 'zod';

/**
 * Zod validation schemas for Strapi Article content type
 * Provides runtime validation to catch malformed API responses
 */

// ========================================
// Base Entity Schemas
// ========================================

const StrapiBaseEntitySchema = z.object({
  id: z.number(),
  documentId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  publishedAt: z.string().nullable().optional(),
  locale: z.string().optional(),
});

// ========================================
// Media File Schema
// ========================================

export const MediaFileSchema = StrapiBaseEntitySchema.extend({
  name: z.string(),
  alternativeText: z.string().nullable().optional(),
  caption: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  formats: z.record(z.unknown()).nullable().optional(),
  hash: z.string().optional(),
  ext: z.string().optional(),
  mime: z.string().optional(),
  size: z.number().optional(),
  url: z.string(),
  previewUrl: z.string().nullable().optional(),
  provider: z.string().optional(),
  provider_metadata: z.record(z.unknown()).nullable().optional(),
});

export type ValidatedMediaFile = z.infer<typeof MediaFileSchema>;

// ========================================
// Author Schema
// ========================================

export const AuthorSchema = StrapiBaseEntitySchema.extend({
  name: z.string(),
  email: z.string().email().optional(),
  avatar: MediaFileSchema.optional(),
});

export type ValidatedAuthor = z.infer<typeof AuthorSchema>;

// ========================================
// Category Schema
// ========================================

export const CategorySchema = StrapiBaseEntitySchema.extend({
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
});

export type ValidatedCategory = z.infer<typeof CategorySchema>;

// ========================================
// Block Component Schemas
// ========================================

const MediaBlockSchema = z.object({
  __component: z.literal('shared.media'),
  id: z.number(),
  file: MediaFileSchema.optional(),
});

const QuoteBlockSchema = z.object({
  __component: z.literal('shared.quote'),
  id: z.number(),
  title: z.string().optional(),
  body: z.string().optional(),
  author: z.string().optional(),
});

const RichTextBlockSchema = z.object({
  __component: z.literal('shared.rich-text'),
  id: z.number(),
  body: z.string().optional(),
});

const SliderBlockSchema = z.object({
  __component: z.literal('shared.slider'),
  id: z.number(),
  files: z.array(MediaFileSchema).optional(),
});

const ArticleBlockSchema = z.discriminatedUnion('__component', [
  MediaBlockSchema,
  QuoteBlockSchema,
  RichTextBlockSchema,
  SliderBlockSchema,
]);

export type ValidatedArticleBlock = z.infer<typeof ArticleBlockSchema>;

// ========================================
// Article Schema
// ========================================

export const ArticleSchema = StrapiBaseEntitySchema.extend({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  featured: z.boolean().optional(),
  author: AuthorSchema.optional(),
  category: CategorySchema.optional(),
  cover: MediaFileSchema.optional(),
  blocks: z.array(ArticleBlockSchema).optional(),
});

export type ValidatedArticle = z.infer<typeof ArticleSchema>;

// ========================================
// Validation Utilities
// ========================================

/**
 * Safely validates article data from Strapi API
 * Returns validated article or null if validation fails
 */
export function validateArticle(data: unknown): ValidatedArticle | null {
  const result = ArticleSchema.safeParse(data);

  if (!result.success) {
    console.error('Article validation failed:', result.error.format());
    return null;
  }

  return result.data;
}

/**
 * Validates article data and throws on failure
 * Use when article must exist (will trigger error boundary)
 */
export function validateArticleStrict(data: unknown): ValidatedArticle {
  return ArticleSchema.parse(data);
}

/**
 * Validates array of articles from Strapi collection response
 */
export function validateArticles(data: unknown): ValidatedArticle[] {
  const ArraySchema = z.array(ArticleSchema);
  const result = ArraySchema.safeParse(data);

  if (!result.success) {
    console.error('Articles validation failed:', result.error.format());
    return [];
  }

  return result.data;
}
