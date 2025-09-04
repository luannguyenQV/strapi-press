/**
 * Strapi Client SDK for News Site
 * Optimized for free tier limits and performance
 */

import { cache } from 'react';

export interface StrapiConfig {
  apiUrl: string;
  apiToken?: string;
  cache?: {
    enabled: boolean;
    ttl?: number;
    maxSize?: number;
  };
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  start?: number;
  limit?: number;
}

export interface FilterParams {
  [key: string]: any;
}

export interface PopulateParams {
  populate?: string | string[] | object;
}

export interface SortParams {
  sort?: string | string[];
}

export type QueryParams = PaginationParams & FilterParams & PopulateParams & SortParams;

class StrapiClient {
  private config: StrapiConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private requestCount = 0;
  private monthlyLimit = 1000000; // Free tier limit

  constructor(config: StrapiConfig) {
    this.config = {
      cache: { enabled: true, ttl: 300000, maxSize: 100 }, // 5 min default
      ...config,
    };
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (key === 'populate') {
        if (typeof value === 'string') {
          searchParams.append('populate', value);
        } else if (Array.isArray(value)) {
          value.forEach(item => searchParams.append('populate', item));
        } else if (typeof value === 'object') {
          searchParams.append('populate', JSON.stringify(value));
        }
      } else if (key === 'sort') {
        if (Array.isArray(value)) {
          searchParams.append('sort', value.join(','));
        } else {
          searchParams.append('sort', value);
        }
      } else if (key === 'filters') {
        searchParams.append('filters', JSON.stringify(value));
      } else {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams.toString();
  }

  /**
   * Check and update API call count
   */
  private checkRateLimit(): void {
    this.requestCount++;
    
    if (this.requestCount > this.monthlyLimit * 0.8) {
      console.warn(`⚠️ Approaching Strapi API limit: ${this.requestCount}/${this.monthlyLimit}`);
    }
    
    if (this.requestCount >= this.monthlyLimit) {
      throw new Error('Monthly API limit reached. Please upgrade your plan.');
    }
  }

  /**
   * Get cached data if available and fresh
   */
  private getCached(key: string): any | null {
    if (!this.config.cache?.enabled) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > (this.config.cache.ttl || 300000);
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set cache data
   */
  private setCache(key: string, data: any): void {
    if (!this.config.cache?.enabled) return;
    
    // Limit cache size
    if (this.cache.size >= (this.config.cache.maxSize || 100)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Make authenticated request to Strapi
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    // Check rate limit
    this.checkRateLimit();
    
    const url = `${this.config.apiUrl}/api/${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };
    
    if (this.config.apiToken) {
      headers['Authorization'] = `Bearer ${this.config.apiToken}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache successful responses
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Strapi request failed:', error);
      throw error;
    }
  }

  /**
   * Find multiple entries
   */
  async find<T = any>(
    contentType: string,
    params?: QueryParams
  ): Promise<{ data: T[]; meta: any }> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    return this.request(`${contentType}${queryString}`);
  }

  /**
   * Find single entry by ID
   */
  async findOne<T = any>(
    contentType: string,
    id: string | number,
    params?: PopulateParams
  ): Promise<{ data: T; meta: any }> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    return this.request(`${contentType}/${id}${queryString}`);
  }

  /**
   * Create new entry
   */
  async create<T = any>(
    contentType: string,
    data: any
  ): Promise<{ data: T; meta: any }> {
    return this.request(`${contentType}`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  /**
   * Update existing entry
   */
  async update<T = any>(
    contentType: string,
    id: string | number,
    data: any
  ): Promise<{ data: T; meta: any }> {
    return this.request(`${contentType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  /**
   * Delete entry
   */
  async delete<T = any>(
    contentType: string,
    id: string | number
  ): Promise<{ data: T; meta: any }> {
    return this.request(`${contentType}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get monthly API usage stats
   */
  getUsageStats() {
    return {
      used: this.requestCount,
      limit: this.monthlyLimit,
      percentage: (this.requestCount / this.monthlyLimit) * 100,
      remaining: this.monthlyLimit - this.requestCount,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance with React cache
export const strapi = new StrapiClient({
  apiUrl: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  apiToken: process.env.STRAPI_API_TOKEN,
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 100,
  },
});

// React Server Component cache wrapper
export const cachedFind = cache(strapi.find.bind(strapi));
export const cachedFindOne = cache(strapi.findOne.bind(strapi));

export default strapi;