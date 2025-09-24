/**
 * Category query hooks using TanStack Query + @strapi/client
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { strapiClient } from '../client';
import { queryKeys } from '../queries/keys';
import type { Category, StrapiResponse, StrapiSingleResponse } from '../types';

// Response interfaces imported from ../types

/**
 * Fetch all categories
 */
export const useCategories = (
  options?: Omit<UseQueryOptions<StrapiResponse<Category>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => strapiClient.collection('categories').find({
      sort: ['name:asc'],
      pagination: { pageSize: 100 }, // Categories are usually limited
    }),
    staleTime: 10 * 60 * 1000, // Categories change less frequently
    ...options,
  });
};

/**
 * Fetch single category by ID
 */
export const useCategory = (
  id: string,
  options?: Omit<UseQueryOptions<StrapiSingleResponse<Category>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.category(id),
    queryFn: () => strapiClient.collection('categories').findOne(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Fetch category by slug
 */
export const useCategoryBySlug = (
  slug: string,
  options?: Omit<UseQueryOptions<StrapiResponse<Category>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [...queryKeys.categories(), 'slug', slug],
    queryFn: async () => {
      const response = await strapiClient.collection('categories').find({
        filters: { slug: { $eq: slug } },
      });
      return response;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// Mutations
/**
 * Create new category
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Category>) =>
      strapiClient.collection('categories').create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    },
  });
};

/**
 * Update existing category
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      strapiClient.collection('categories').update(id, data),
    onSuccess: (updatedCategory, variables) => {
      // Update specific category cache
      queryClient.setQueryData(
        queryKeys.category(variables.id),
        { data: updatedCategory.data, meta: updatedCategory.meta }
      );

      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    },
  });
};

/**
 * Delete category
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      strapiClient.collection('categories').delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: queryKeys.category(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    },
  });
};