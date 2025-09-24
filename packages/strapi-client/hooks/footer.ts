/**
 * Footer query hooks using TanStack Query + @strapi/client
 * Footer is a single-type in Strapi
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { strapiClient } from '../client';
import { queryKeys } from '../queries/keys';
import type { Footer, StrapiSingleResponse } from '../types';

/**
 * Fetch footer data (single type)
 */
export const useFooter = (
  options?: Omit<UseQueryOptions<StrapiSingleResponse<Footer>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.footer(),
    queryFn: () => strapiClient.single('footer').find({
      populate: {
        logo: true,
        socialLinks: true,
        menuLinks: true,
      },
    }),
    staleTime: 30 * 60 * 1000, // Footer data changes infrequently - 30 minutes
    ...options,
  });
};

/**
 * Update footer data
 */
export const useUpdateFooter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Footer>) =>
      strapiClient.single('footer').update(data),
    onSuccess: (updatedFooter) => {
      // Update footer cache directly
      queryClient.setQueryData(queryKeys.footer(), updatedFooter);
    },
  });
};