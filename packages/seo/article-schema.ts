import type { Article, Person, WithContext } from 'schema-dts';

/**
 * Article JSON-LD schema generator utilities
 * Creates structured data for better SEO and rich search results
 */

export interface ArticleSchemaProps {
  title: string;
  description: string;
  publishedAt?: string | null;
  updatedAt?: string;
  author?: {
    name: string;
    email?: string;
  };
  coverImage?: {
    url: string;
    width?: number | null;
    height?: number | null;
    alt?: string | null;
  };
  url: string;
  backendUrl: string;
}

/**
 * Generate Article schema for JSON-LD
 * https://schema.org/Article
 */
export function createArticleSchema(
  props: ArticleSchemaProps
): WithContext<Article> {
  const {
    title,
    description,
    publishedAt,
    updatedAt,
    author,
    coverImage,
    url,
    backendUrl,
  } = props;

  const schema: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
  };

  // Add published/modified dates
  if (publishedAt) {
    schema.datePublished = publishedAt;
  }

  if (updatedAt) {
    schema.dateModified = updatedAt;
  }

  // Add author if available
  if (author?.name) {
    schema.author = createPersonSchema({
      name: author.name,
      email: author.email,
    });
  }

  // Add cover image if available
  if (coverImage?.url) {
    const imageUrl = `${backendUrl}${coverImage.url}`;

    schema.image = {
      '@type': 'ImageObject',
      url: imageUrl,
      ...(coverImage.width && {
        width: { '@type': 'QuantitativeValue', value: coverImage.width },
      }),
      ...(coverImage.height && {
        height: { '@type': 'QuantitativeValue', value: coverImage.height },
      }),
      caption: coverImage.alt ?? undefined,
    };
  }

  return schema;
}

/**
 * Generate Person schema for JSON-LD
 * https://schema.org/Person
 */
export function createPersonSchema(props: {
  name: string;
  email?: string;
}): Person {
  const schema: Person = {
    '@type': 'Person',
    name: props.name,
  };

  if (props.email) {
    schema.email = props.email;
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema for article pages
 * https://schema.org/BreadcrumbList
 */
export function createArticleBreadcrumbSchema(props: {
  homeUrl: string;
  blogUrl: string;
  articleTitle: string;
  articleUrl: string;
  categoryName?: string;
  categoryUrl?: string;
}) {
  const {
    homeUrl,
    blogUrl,
    articleTitle,
    articleUrl,
    categoryName,
    categoryUrl,
  } = props;

  const items = [
    {
      '@type': 'ListItem' as const,
      position: 1,
      name: 'Home',
      item: homeUrl,
    },
    {
      '@type': 'ListItem' as const,
      position: 2,
      name: 'Blog',
      item: blogUrl,
    },
  ];

  // Add category if available
  if (categoryName && categoryUrl) {
    items.push({
      '@type': 'ListItem' as const,
      position: 3,
      name: categoryName,
      item: categoryUrl,
    });

    items.push({
      '@type': 'ListItem' as const,
      position: 4,
      name: articleTitle,
      item: articleUrl,
    });
  } else {
    items.push({
      '@type': 'ListItem' as const,
      position: 3,
      name: articleTitle,
      item: articleUrl,
    });
  }

  return {
    '@context': 'https://schema.org' as const,
    '@type': 'BreadcrumbList' as const,
    itemListElement: items,
  };
}
