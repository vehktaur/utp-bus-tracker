import type { BusRoute } from '~/types';
import { ApiUrl, appRequest, HttpMethodType, isMockApi } from '~/utils';
import { seedRoutes } from '~/utils/mock/seed';

describe('mock API through appRequest', () => {
  it('is used when no backend is configured', () => {
    expect(isMockApi).toBe(true);
  });

  it('lists the seed routes', async () => {
    const { data } = await appRequest<BusRoute[]>({ url: ApiUrl.ROUTE.BASE });
    expect(data.map((route) => route.id)).toEqual(
      seedRoutes.map((route) => route.id),
    );
  });

  it('saves an update and reads it back', async () => {
    const { id, updatedAt: _updatedAt, ...payload } = seedRoutes[0];

    await appRequest({
      url: ApiUrl.ROUTE.DETAIL(id),
      method: HttpMethodType.PUT,
      data: { ...payload, name: 'Renamed route' },
    });
    const { data } = await appRequest<BusRoute>({
      url: ApiUrl.ROUTE.DETAIL(id),
    });

    expect(data.name).toBe('Renamed route');
  });

  it('restores the sample data', async () => {
    const { data } = await appRequest<BusRoute[]>({
      url: ApiUrl.ROUTE.RESET,
      method: HttpMethodType.POST,
    });
    expect(data[0].name).toBe(seedRoutes[0].name);
  });

  it('returns a 404 for an unknown route', async () => {
    await expect(
      appRequest({ url: ApiUrl.ROUTE.DETAIL('nowhere') }),
    ).rejects.toMatchObject({ response: { status: 404 } });
  });
});
