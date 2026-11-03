import type { BusRoute, BusRoutePayload } from '~/types';
import { ROUTES_STORAGE_KEY } from '../constants/config';
import { seedRoutes } from './seed';

const read = (): BusRoute[] => {
  try {
    const raw = localStorage.getItem(ROUTES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BusRoute[]) : seedRoutes;
  } catch {
    return seedRoutes;
  }
};

const write = (routes: BusRoute[]) => {
  try {
    localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
  } catch {
    // Storage can be unavailable (private mode); edits then last for the session only.
  }
};

/** A tiny localStorage "database" so the demo works without a backend. */
export const mockDb = {
  listRoutes: () => read(),

  getRoute: (id: string) => read().find((route) => route.id === id) ?? null,

  updateRoute: (id: string, input: BusRoutePayload) => {
    const routes = read();
    const index = routes.findIndex((route) => route.id === id);
    if (index === -1) return null;

    const updated: BusRoute = {
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    };
    routes[index] = updated;
    write(routes);

    return updated;
  },

  reset: () => {
    write(seedRoutes);
    return seedRoutes;
  },
};
