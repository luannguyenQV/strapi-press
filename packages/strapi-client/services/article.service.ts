/**
 * Article Service Layer
 * Handles all article-related API operations with optimization
 */

import strapi, { cachedFind, cachedFindOne } from '../index';
import type { QueryParams } from '../index';

// Strapi v5 Media interface
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

// Strapi v5 flat interface (actual return structure)
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
  author?: {
    id: number;
    name: string;
    email?: string;
    bio?: string;
    avatar?: Media;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
  };
  cover?: Media;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaRobots?: string;
    canonicalURL?: string;
    structuredData?: any;
  };
}

// Legacy Strapi v4 interface (for backwards compatibility)
export interface LegacyArticle {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    publishedAt: string;
    updatedAt: string;
    featured: boolean;
    viewCount: number;
    readingTime: number;
    status: 'draft' | 'published' | 'archived';
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      metaRobots?: string;
      canonicalURL?: string;
      structuredData?: any;
    };
    author?: {
      data: Author;
    };
    categories?: {
      data: Category[];
    };
    tags?: {
      data: Tag[];
    };
    featuredImage?: {
      data: Media;
    };
    gallery?: {
      data: Media[];
    };
    comments?: {
      data: Comment[];
    };
    relatedArticles?: {
      data: Article[];
    };
  };
}

export interface Author {
  id: number;
  attributes: {
    name: string;
    slug: string;
    email: string;
    bio?: string;
    role: string;
    avatar?: {
      data: Media;
    };
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
      website?: string;
    };
  };
}

export interface Category {
  id: number;
  attributes: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    parent?: {
      data: Category;
    };
  };
}

export interface Tag {
  id: number;
  attributes: {
    name: string;
    slug: string;
  };
}

export interface Media {
  id: number;
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats: {
      thumbnail?: MediaFormat;
      small?: MediaFormat;
      medium?: MediaFormat;
      large?: MediaFormat;
    };
    url: string;
    previewUrl?: string;
    provider: string;
    size: number;
    mime: string;
  };
}

export interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

export interface Comment {
  id: number;
  attributes: {
    content: string;
    authorName: string;
    authorEmail: string;
    publishedAt: string;
    approved: boolean;
    parentComment?: {
      data: Comment;
    };
  };
}

export interface ArticleFilters {
  title?: { $contains?: string };
  slug?: { $eq?: string };
  status?: { $eq?: string };
  featured?: { $eq?: boolean };
  publishedAt?: {
    $gte?: string;
    $lte?: string;
    $between?: [string, string];
  };
  author?: {
    slug?: { $eq?: string };
  };
  categories?: {
    slug?: { $in?: string[] };
  };
  tags?: {
    slug?: { $in?: string[] };
  };
}

class ArticleService {
  /**
   * Get paginated articles with optional filters
   */
  async getArticles(params?: {
    page?: number;
    pageSize?: number;
    filters?: ArticleFilters;
    sort?: string | string[];
    populate?: string | string[] | object;
  }) {
    const defaultParams: QueryParams = {
      populate: {
        author: {
          populate: ['avatar'],
        },
        categories: true,
        tags: true,
        featuredImage: true,
        seo: true,
      },
      sort: ['publishedAt:desc'],
      pagination: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      },
      ...params?.filters && { filters: params.filters },
    };

    return cachedFind<Article>('articles', {
      ...defaultParams,
      ...params,
    });
  }

  /**
   * Get single article by slug with full details
   */
  async getArticleBySlug(slug: string) {
    const response = await cachedFind<Article>('articles', {
      filters: {
        slug: { $eq: slug },
        status: { $eq: 'published' },
      },
      populate: {
        author: {
          populate: ['avatar', 'articles'],
        },
        categories: true,
        tags: true,
        featuredImage: true,
        gallery: true,
        seo: true,
        comments: {
          filters: {
            approved: { $eq: true },
          },
          sort: ['createdAt:desc'],
          populate: ['parentComment'],
        },
        relatedArticles: {
          populate: ['featuredImage', 'author', 'categories'],
        },
      },
    });

    if (!response.data || response.data.length === 0) {
      return null;
    }

    // Increment view count (non-blocking)
    this.incrementViewCount(response.data[0].id).catch(console.error);

    return response.data[0];
  }

  /**
   * Get featured articles for homepage
   */
  async getFeaturedArticles(limit = 6) {
    return cachedFind<Article>('articles', {
      fields: ['title', 'description', 'slug', 'publishedAt'],
      populate: {
        author: {
          fields: ['name'],
        },
        category: {
          fields: ['name'],
        },
        cover: {
          fields: ['url', 'alternativeText', 'width', 'height'],
        },
      },
      sort: ['publishedAt:desc'],
      pagination: {
        limit,
      },
    });
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(categorySlug: string, params?: {
    page?: number;
    pageSize?: number;
  }) {
    return this.getArticles({
      ...params,
      filters: {
        categories: {
          slug: { $in: [categorySlug] },
        },
      },
    });
  }

  /**
   * Get articles by author
   */
  async getArticlesByAuthor(authorSlug: string, params?: {
    page?: number;
    pageSize?: number;
  }) {
    return this.getArticles({
      ...params,
      filters: {
        author: {
          slug: { $eq: authorSlug },
        },
      },
    });
  }

  /**
   * Get articles by tag
   */
  async getArticlesByTag(tagSlug: string, params?: {
    page?: number;
    pageSize?: number;
  }) {
    return this.getArticles({
      ...params,
      filters: {
        tags: {
          slug: { $in: [tagSlug] },
        },
      },
    });
  }

  /**
   * Search articles
   */
  async searchArticles(query: string, params?: {
    page?: number;
    pageSize?: number;
  }) {
    return this.getArticles({
      ...params,
      filters: {
        $or: [
          { title: { $contains: query } },
          { excerpt: { $contains: query } },
          { content: { $contains: query } },
        ],
      },
    });
  }

  /**
   * Get related articles based on categories and tags
   */
  async getRelatedArticles(articleId: number, limit = 4) {
    const article = await cachedFindOne<Article>('articles', articleId, {
      populate: ['categories', 'tags'],
    });

    if (!article.data) return { data: [] };

    const categoryIds = article.data.attributes.categories?.data.map(c => c.id) || [];
    const tagIds = article.data.attributes.tags?.data.map(t => t.id) || [];

    return cachedFind<Article>('articles', {
      filters: {
        $and: [
          { id: { $ne: articleId } },
          { status: { $eq: 'published' } },
          {
            $or: [
              { categories: { id: { $in: categoryIds } } },
              { tags: { id: { $in: tagIds } } },
            ],
          },
        ],
      },
      populate: ['author', 'featuredImage', 'categories'],
      sort: ['publishedAt:desc'],
      pagination: { limit },
    });
  }

  /**
   * Get trending articles based on view count
   */
  async getTrendingArticles(limit = 5) {
    return cachedFind<Article>('articles', {
      filters: {
        status: { $eq: 'published' },
        publishedAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
        },
      },
      populate: ['author', 'featuredImage'],
      sort: ['viewCount:desc', 'publishedAt:desc'],
      pagination: { limit },
    });
  }

  /**
   * Increment article view count
   */
  private async incrementViewCount(articleId: number) {
    try {
      const article = await strapi.findOne<Article>('articles', articleId);
      const currentCount = article.data.attributes.viewCount || 0;
      
      await strapi.update('articles', articleId, {
        viewCount: currentCount + 1,
      });
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  }

  /**
   * Create article comment
   */
  async createComment(articleId: number, comment: {
    content: string;
    authorName: string;
    authorEmail: string;
    parentCommentId?: number;
  }) {
    return strapi.create('comments', {
      ...comment,
      article: articleId,
      approved: false, // Require moderation
      publishedAt: new Date().toISOString(),
    });
  }

  /**
   * Get article archives by month
   */
  async getArchives() {
    const articles = await cachedFind<Article>('articles', {
      filters: {
        status: { $eq: 'published' },
      },
      fields: ['publishedAt'],
      sort: ['publishedAt:desc'],
      pagination: { limit: -1 }, // Get all
    });

    // Group by month
    const archives = new Map<string, number>();
    
    articles.data.forEach(article => {
      const date = new Date(article.attributes.publishedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      archives.set(key, (archives.get(key) || 0) + 1);
    });

    return Array.from(archives.entries()).map(([month, count]) => ({
      month,
      count,
      year: parseInt(month.split('-')[0]),
      monthNum: parseInt(month.split('-')[1]),
    }));
  }
}

export const articleService = new ArticleService();
export default articleService;