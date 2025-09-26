/**
 * Generic hook factory for creating type-safe Strapi hooks
 * Reduces code duplication and provides consistent patterns
 */

import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { strapiClient } from '../client';
import type {
  QueryParams,
  StrapiResponse,
  StrapiSingleResponse,
} from '../types';
import {
  bridgeCollectionResponse,
  bridgeSingleResponse,
  safeCastParams,
} from '../types';

// Generic factory for collection queries (find)
export const createFindHook = <T>(
  contentType: string,
  queryKeyFactory: (params?: QueryParams) => readonly unknown[]
) => {
  return (
    params?: QueryParams,
    options?: Omit<UseQueryOptions<StrapiResponse<T>>, 'queryKey' | 'queryFn'>
  ) => {
    return useQuery({
      queryKey: queryKeyFactory(params),
      queryFn: async () => {
        const response = await strapiClient
          .collection(contentType)
          .find(safeCastParams(params || {}));
        return bridgeCollectionResponse<T>(response);
      },
      staleTime: 5 * 60 * 1000, // Default 5 minutes
      ...options,
    });
  };
};

// Generic factory for single item queries (findOne)
export const createFindOneHook = <T>(
  contentType: string,
  queryKeyFactory: (id: string) => readonly unknown[]
) => {
  return (
    id: string,
    params?: QueryParams,
    options?: Omit<
      UseQueryOptions<StrapiSingleResponse<T>>,
      'queryKey' | 'queryFn'
    >
  ) => {
    return useQuery({
      queryKey: queryKeyFactory(id),
      queryFn: async () => {
        const response = await strapiClient
          .collection(contentType)
          .findOne(id, safeCastParams(params || {}));
        return bridgeSingleResponse<T>(response);
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // Default 5 minutes
      ...options,
    });
  };
};

// Generic factory for create mutations
export const createCreateMutation = <T>(
  contentType: string,
  invalidationKeys: readonly unknown[]
) => {
  return (
    options?: Omit<
      UseMutationOptions<StrapiSingleResponse<T>, Error, Partial<T>>,
      'mutationFn'
    >
  ) => {
    const queryClient = useQueryClient();

    const mergedOptions = {
      ...options,
      mutationFn: async (data: Partial<T>) => {
        const response = await strapiClient
          .collection(contentType)
          .create(safeCastParams(data));
        return bridgeSingleResponse<T>(response);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: invalidationKeys });
        // Note: User callback chaining disabled due to TypeScript signature mismatch
        // TODO: Investigate TanStack Query v5 onSuccess signature compatibility
      },
    };

    return useMutation(mergedOptions);
  };
};

// Generic factory for update mutations
export const createUpdateMutation = <T>(
  contentType: string,
  queryKeyFactory: (id: string) => readonly unknown[],
  invalidationKeys: readonly unknown[]
) => {
  return (
    options?: Omit<
      UseMutationOptions<
        StrapiSingleResponse<T>,
        Error,
        { id: string; data: Partial<T> }
      >,
      'mutationFn'
    >
  ) => {
    const queryClient = useQueryClient();

    const mergedOptions = {
      ...options,
      mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
        const response = await strapiClient
          .collection(contentType)
          .update(id, safeCastParams(data));
        return bridgeSingleResponse<T>(response);
      },
      onSuccess: (
        updatedItem: StrapiSingleResponse<T>,
        variables: { id: string; data: Partial<T> }
      ) => {
        // Update specific item cache
        queryClient.setQueryData(queryKeyFactory(variables.id), {
          data: updatedItem.data,
          meta: updatedItem.meta,
        });
        // Invalidate collection queries
        queryClient.invalidateQueries({ queryKey: invalidationKeys });
        // Note: User callback chaining disabled due to TypeScript signature mismatch
      },
    };

    return useMutation(mergedOptions);
  };
};

// Generic factory for delete mutations
export const createDeleteMutation = <T>(
  contentType: string,
  queryKeyFactory: (id: string) => readonly unknown[],
  invalidationKeys: readonly unknown[]
) => {
  return (
    options?: Omit<
      UseMutationOptions<StrapiSingleResponse<T>, Error, string>,
      'mutationFn'
    >
  ) => {
    const queryClient = useQueryClient();

    const mergedOptions = {
      ...options,
      mutationFn: async (id: string) => {
        const response = await strapiClient.collection(contentType).delete(id);
        return bridgeSingleResponse<T>(response);
      },
      onSuccess: (
        data: StrapiSingleResponse<T>,
        deletedId: string
      ) => {
        // Remove from cache
        queryClient.removeQueries({ queryKey: queryKeyFactory(deletedId) });
        // Invalidate collection queries
        queryClient.invalidateQueries({ queryKey: invalidationKeys });
        // Note: User callback chaining disabled due to TypeScript signature mismatch
      },
    };

    return useMutation(mergedOptions);
  };
};

// Single-type (non-collection) factories
export const createSingleFindHook = <T>(
  contentType: string,
  queryKeyFactory: () => readonly unknown[]
) => {
  return (
    params?: QueryParams,
    options?: Omit<
      UseQueryOptions<StrapiSingleResponse<T>>,
      'queryKey' | 'queryFn'
    >
  ) => {
    return useQuery({
      queryKey: queryKeyFactory(),
      queryFn: async () => {
        const response = await strapiClient
          .single(contentType)
          .find(safeCastParams(params || {}));
        return bridgeSingleResponse<T>(response);
      },
      staleTime: 30 * 60 * 1000, // Single types cache longer (30 minutes)
      ...options,
    });
  };
};

export const createSingleUpdateMutation = <T>(
  contentType: string,
  queryKeyFactory: () => readonly unknown[]
) => {
  return (
    options?: Omit<
      UseMutationOptions<StrapiSingleResponse<T>, Error, Partial<T>>,
      'mutationFn'
    >
  ) => {
    const queryClient = useQueryClient();

    const mergedOptions = {
      ...options,
      mutationFn: async (data: Partial<T>) => {
        const response = await strapiClient
          .single(contentType)
          .update(safeCastParams(data));
        return bridgeSingleResponse<T>(response);
      },
      onSuccess: (updatedItem: StrapiSingleResponse<T>) => {
        queryClient.setQueryData(queryKeyFactory(), updatedItem);
        // Note: User callback chaining disabled due to TypeScript signature mismatch
      },
    };

    return useMutation(mergedOptions);
  };
};
