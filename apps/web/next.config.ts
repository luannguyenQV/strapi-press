import { env } from '@/env';
import { config, withAnalyzer } from '@repo/next-config';
import type { NextConfig } from 'next';

let nextConfig: NextConfig = {
  ...config,
};

// Add Strapi backend remote pattern for images
// Supports both development (localhost) and production URLs
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

try {
  const url = new URL(strapiUrl);
  const isLocalhost =
    url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  if (!isLocalhost) {
    // Production: Add the actual Strapi hostname
    nextConfig.images?.remotePatterns?.push({
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port || undefined,
    });
  }
  // Note: localhost is already configured in @repo/next-config base config
} catch (error) {
  console.warn(
    'Invalid NEXT_PUBLIC_STRAPI_URL, skipping image remote pattern:',
    error
  );
}

if (process.env.NODE_ENV === 'production') {
  const redirects: NextConfig['redirects'] = async () => [
    {
      source: '/legal',
      destination: '/legal/privacy',
      statusCode: 301,
    },
  ];

  nextConfig.redirects = redirects;
}

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
