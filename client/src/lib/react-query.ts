

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const defaultOptions: DefaultOptions = {
  queries: {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    networkMode: 'online',
  },
  mutations: {
    retry: 1,
    networkMode: 'online',
  },
};

export const queryClient = new QueryClient({
  defaultOptions,
});