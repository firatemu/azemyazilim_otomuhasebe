import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache'i tamamen devre dışı bırak - her zaman fresh data
      staleTime: 0,
      gcTime: 0, // Eski cacheTime yerine gcTime (v5)
      retry: 1,
      refetchOnWindowFocus: true, // Her focus'ta yeniden fetch
      refetchOnMount: true, // Her mount'ta yeniden fetch
      refetchOnReconnect: true, // Bağlantı kurulduğunda yeniden fetch
    },
    mutations: {
      // Mutation cache'i de devre dışı
      gcTime: 0,
    },
  },
});

