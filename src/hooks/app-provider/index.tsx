import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { APIProvider } from '@vis.gl/react-google-maps';
import type { ReactNode } from 'react';
import { Toaster } from '~/components/ui/sonner';
import { GOOGLE_MAPS_API_KEY } from '~/utils';
import '~/styles/index.css';

// Only loads the Maps script when there's a key to load it with
const MapsProvider = ({ children }: { children: ReactNode }) =>
  GOOGLE_MAPS_API_KEY ? (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>{children}</APIProvider>
  ) : (
    children
  );

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <MapsProvider>
      {children}
      <Toaster position="top-center" />
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </MapsProvider>
  );
}
