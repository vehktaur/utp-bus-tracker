import { act } from '@testing-library/react';
import { useSharingStore } from '~/store';

const store = () => useSharingStore.getState();

describe('useSharingStore', () => {
  beforeEach(() => {
    act(() => {
      store().stopSharing();
      useSharingStore.setState({ myStops: {}, role: 'rider' });
    });
  });

  it('gives the device an anonymous id', () => {
    expect(store().deviceId).toMatch(/\w{8,}/);
  });

  it('starts and stops sharing on a route', () => {
    act(() => store().startSharing('route-a'));
    expect(store().sharingRouteId).toBe('route-a');
    expect(store().sharingSince).toBeTypeOf('number');

    act(() => store().stopSharing());
    expect(store().sharingRouteId).toBeNull();
  });

  it('toggles the followed stop per route', () => {
    act(() => store().toggleMyStop('route-a', 'stop-1'));
    act(() => store().toggleMyStop('route-b', 'stop-9'));
    expect(store().myStops).toEqual({
      'route-a': 'stop-1',
      'route-b': 'stop-9',
    });

    act(() => store().toggleMyStop('route-a', 'stop-1'));
    expect(store().myStops).toEqual({ 'route-b': 'stop-9' });
  });

  it('never persists an active share across reloads', () => {
    act(() => store().startSharing('route-a'));
    const persisted = JSON.parse(
      localStorage.getItem('utp_bus_tracker_sharing') ?? '{}',
    );

    expect(persisted.state).not.toHaveProperty('sharingRouteId');
    expect(persisted.state).toHaveProperty('deviceId');
  });
});
