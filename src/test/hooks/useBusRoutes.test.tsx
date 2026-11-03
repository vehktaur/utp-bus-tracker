import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { useBusRoutes, useUpdateBusRoute } from '~/hooks';
import { seedRoutes } from '~/utils/mock/seed';
import { createTestQueryClient, createWrapper } from '../testUtils';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('bus route queries', () => {
  it('loads every route', async () => {
    const { result } = renderHook(() => useBusRoutes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(seedRoutes.length);
  });

  it('saves a route, refreshes the list, and confirms with a toast', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = createWrapper(queryClient);
    const { result: routes } = renderHook(() => useBusRoutes(), { wrapper });
    const { result: update } = renderHook(() => useUpdateBusRoute(), {
      wrapper,
    });
    await waitFor(() => expect(routes.current.isSuccess).toBe(true));

    const { id, updatedAt: _updatedAt, ...data } = seedRoutes[0];
    act(() =>
      update.current.mutate({ id, data: { ...data, name: 'Night bus' } }),
    );

    await waitFor(() => expect(update.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Night bus saved');
    await waitFor(() =>
      expect(routes.current.data?.[0].name).toBe('Night bus'),
    );
  });

  it('reports a failed save', async () => {
    const { result } = renderHook(() => useUpdateBusRoute(), {
      wrapper: createWrapper(),
    });
    const { updatedAt: _updatedAt, id: _id, ...data } = seedRoutes[0];

    act(() => result.current.mutate({ id: 'missing', data }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Route not found', {
      description: undefined,
    });
  });
});
