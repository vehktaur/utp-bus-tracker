import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toastApiError } from './toast';

const TOAST_COOLDOWN_MS = 5000;
const lastToastAt = new Map<string, number>();

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silent || !navigator.onLine) return;

      const now = Date.now();
      if (now - (lastToastAt.get(query.queryHash) ?? 0) < TOAST_COOLDOWN_MS) {
        return;
      }
      lastToastAt.set(query.queryHash, now);

      toastApiError(error, "We couldn't load this data. Please try again.");
    },
  }),
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});
