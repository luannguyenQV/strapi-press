import { strapiClient } from '../client';
import { BaseResponse } from '../types';

export interface FooterLink {
  id: number;
  label: string;
  url: string;
  isExternal?: boolean;
  openInNewTab?: boolean;
}

export interface NavigationColumn {
  id: number;
  title: string;
  links?: FooterLink[];
}

export interface SocialLink {
  id: number;
  platform: 'facebook' | 'twitter' | 'x' | 'instagram' | 'linkedin' | 'youtube' | 'github' | 'discord' | 'telegram' | 'tiktok';
  url: string;
  label?: string;
}

export interface Footer {
  id: number;
  columns?: NavigationColumn[];
  socialLinks?: SocialLink[];
  copyright?: string;
  bottomLinks?: FooterLink[];
  createdAt: string;
  updatedAt: string;
}

export interface FooterResponse extends BaseResponse<Footer> {}

class FooterService {
  private cache: Map<string, { data: Footer | null; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute cache

  async getFooter(locale?: string): Promise<Footer | null> {
    const cacheKey = `footer_${locale || 'default'}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const params = new URLSearchParams({
        'populate[columns][populate][links]': '*',
        'populate[socialLinks]': '*',
        'populate[bottomLinks]': '*',
      });

      if (locale) {
        params.append('locale', locale);
      }

      const response = await strapiClient.get<FooterResponse>(`/footer?${params}`);

      const footerData = response.data || null;

      this.cache.set(cacheKey, {
        data: footerData,
        timestamp: Date.now(),
      });

      return footerData;
    } catch (error) {
      console.error('Error fetching footer:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const footerService = new FooterService();