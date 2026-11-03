export const appName = 'UTP Bus Tracker';
export const projectId = 'utp_bus_tracker';
export const ROUTES_STORAGE_KEY = `${projectId}_routes`;
export const SHARING_STORAGE_KEY = `${projectId}_sharing`;

export const DEFAULT_API_ERROR = 'Something went wrong. Please try again.';

export const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? '';
export const GOOGLE_MAP_ID =
  (import.meta.env.VITE_GOOGLE_MAP_ID as string | undefined) || 'DEMO_MAP_ID';
