/**
 * @repo/seo - SEO utilities and structured data generators
 */

// Metadata utilities
export { createMetadata } from './metadata';

// JSON-LD component
export { JsonLd } from './json-ld';

// Article schema generators
export {
  createArticleSchema,
  createPersonSchema,
  createArticleBreadcrumbSchema,
  type ArticleSchemaProps,
} from './article-schema';
