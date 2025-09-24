import { strapiClient } from '../client';
import type { Footer, StrapiSingleResponse } from '../types';

// Note: Footer, SocialLink, MenuLink, ContactInfo are now imported from '../types'

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
      const response = await strapiClient.single('footer').find({
        populate: {
          logo: true,
          socialLinks: true,
          menuLinks: true,
          contactInfo: true,
        },
        ...(locale && { locale }),
      });

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