import { AxiosError } from 'axios';
import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import type { BusRoutePayload } from '~/types';
import { mockDb } from './db';

const LATENCY_MS = 250;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const respond = <T>(
  config: InternalAxiosRequestConfig,
  status: number,
  data: T,
): AxiosResponse<T> => {
  const response = {
    data,
    status,
    statusText: String(status),
    headers: {},
    config,
  };

  if (status >= 400) {
    throw new AxiosError(
      (data as { message?: string }).message ?? 'Request failed',
      String(status),
      config,
      null,
      response,
    );
  }

  return response;
};

const parseBody = <T>(data: unknown): T =>
  (typeof data === 'string' ? JSON.parse(data) : data) as T;

// Answers API calls from localStorage until VITE_BASE_ENDPOINT points at a real backend
export const mockAdapter: AxiosAdapter = async (config) => {
  await wait(LATENCY_MS);

  const method = (config.method ?? 'get').toUpperCase();
  const path = (config.url ?? '').replace(/^\/+/, '');
  const [resource, id] = path.split('/');

  if (resource === 'routes' && method === 'GET' && !id) {
    return respond(config, 200, mockDb.listRoutes());
  }

  if (resource === 'routes' && method === 'POST' && id === 'reset') {
    return respond(config, 200, mockDb.reset());
  }

  if (resource === 'routes' && id) {
    if (method === 'GET') {
      const route = mockDb.getRoute(id);
      return route
        ? respond(config, 200, route)
        : respond(config, 404, { message: 'Route not found' });
    }

    if (method === 'PUT') {
      const updated = mockDb.updateRoute(
        id,
        parseBody<BusRoutePayload>(config.data),
      );
      return updated
        ? respond(config, 200, updated)
        : respond(config, 404, { message: 'Route not found' });
    }
  }

  return respond(config, 404, { message: `No mock for ${method} /${path}` });
};
