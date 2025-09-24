/**
 * Official Strapi client configuration
 * Uses @strapi/client for proper API integration
 */

import { strapi } from '@strapi/client';

// Create the official Strapi client instance
export const strapiClient = strapi({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337/api',
  apiToken: process.env.STRAPI_API_TOKEN,
});

// Configuration object for environment settings
export const config = {
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
  apiToken: process.env.STRAPI_API_TOKEN,
};

// Export the client as default for backward compatibility
export default strapiClient;
