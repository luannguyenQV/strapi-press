import 'server-only';
import type { NextRequest } from 'next/server';

// Create a middleware function that accepts a callback
export const authMiddleware = (handler: (request: NextRequest) => Response | Promise<Response>) => {
  return async (request: NextRequest) => {
    // For now, just call the handler with the request
    // In a real implementation, you'd check authentication here and pass auth info
    return handler(request);
  };
};
