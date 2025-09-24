import { cachedFind } from '../index';

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    id: number;
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

class CategoryService {
  /**
   * Get all categories
   */
  getAll(params?: {
    sort?: string[];
    pagination?: { limit?: number; page?: number };
  }) {
    return cachedFind<Category>('categories', {
      sort: params?.sort || ['name:asc'],
      pagination: params?.pagination || { limit: 100 },
      populate: {
        image: true,
      },
    });
  }

  /**
   * Get category by slug
   */
  async getBySlug(slug: string) {
    const response = await cachedFind<Category>('categories', {
      filters: {
        slug: { $eq: slug },
      },
      populate: {
        image: true,
      },
    });

    return response.data[0] || null;
  }

  /**
   * Get category with article count
   */
  getCategoriesWithArticleCount() {
    return cachedFind<Category>('categories', {
      populate: {
        articles: {
          fields: ['id'],
        },
        image: true,
      },
      sort: ['name:asc'],
    });
  }

  /**
   * Get featured categories (limit to featured ones if you have that field)
   */
  getFeaturedCategories(limit = 6) {
    return cachedFind<Category>('categories', {
      sort: ['name:asc'],
      pagination: { limit },
      populate: {
        image: true,
      },
    });
  }
}

export const categoryService = new CategoryService();
