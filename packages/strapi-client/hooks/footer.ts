/**
 * Footer query hooks using TanStack Query + @strapi/client
 * Footer is a single-type in Strapi
 */

import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { strapiClient } from '../client';
import { queryKeys } from '../queries/keys';
import type { Footer, StrapiSingleResponse } from '../types';
import { bridgeFooterSingle, safeCastParams } from '../types';

/**
 * Fetch footer data (single type)
 */
export const useFooter = (
  options?: Omit<
    UseQueryOptions<StrapiSingleResponse<Footer>>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: queryKeys.footer(),
    queryFn: async () => {
      const response = await strapiClient.single('footer').find(
        safeCastParams({
          populate: {
            logo: true,
            socialLinks: true,
            menuLinks: true,
          },
        })
      );
      return bridgeFooterSingle(response);
    },
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
    mutationFn: async (data: Partial<Footer>) => {
      const response = await strapiClient
        .single('footer')
        .update(safeCastParams(data));
      return bridgeFooterSingle(response);
    },
    onSuccess: (updatedFooter) => {
      // Update footer cache directly
      queryClient.setQueryData(queryKeys.footer(), updatedFooter);
    },
  });
};
