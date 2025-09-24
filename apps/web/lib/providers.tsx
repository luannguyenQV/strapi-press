/**
 * Client-side providers for the Next.js application
 * Includes TanStack Query provider for server state management
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance with optimized defaults
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // Cache settings matching your original implementation
          staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
          gcTime: 10 * 60 * 1000,   // 10 minutes - cache retention (formerly cacheTime)

          // Optimize for performance
          refetchOnWindowFocus: false, // Avoid excessive refetching
          refetchOnReconnect: true,    // Refetch on network reconnect
          refetchOnMount: true,        // Refetch when component mounts

          // Error handling
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors
            if (error?.status >= 400 && error?.status < 500) {
              return false;
            }
            // Retry up to 3 times for other errors
            return failureCount < 3;
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
          // Mutation defaults
          retry: 1,
          retryDelay: 1000,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}