import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary, NotFound } from '~/components';
import { AppProvider } from '~/hooks';

function RootComponent() {
  return (
    <>
      <HeadContent />
      <AppProvider>
        <Outlet />
      </AppProvider>
    </>
  );
}

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  errorComponent: ErrorBoundary,
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { title: 'UTP Bus Tracker' },
      {
        name: 'description',
        content: 'Live shuttle bus locations, shared by the people on board.',
      },
    ],
  }),
});
