import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StopTimeline from '~/pages/track/-components/StopTimeline';
import { useSharingStore } from '~/store';
import type { TrackingSnapshot } from '~/types';
import { seedRoutes } from '~/utils/mock/seed';

const route = seedRoutes[0];
const now = new Date(2026, 10, 3, 7, 6).getTime();

const snapshot: TrackingSnapshot = {
  now,
  nextTrip: null,
  estimate: {
    status: 'live',
    position: null,
    heading: null,
    distanceAlong: 2000,
    speedMps: 9,
    contributors: 1,
    devices: [],
    trip: null,
    lastLive: null,
  },
  etas: route.stops.map((stop, index) => ({
    stopId: stop.id,
    passed: index < 2,
    expectedAt: index < 2 ? null : now + index * 120_000,
    scheduledAt: null,
  })),
};

describe('StopTimeline', () => {
  it('marks passed stops and places the bus after them', () => {
    render(<StopTimeline route={route} snapshot={snapshot} />);

    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('Passed')).toBeInTheDocument();
    expect(items[2]).toHaveAccessibleName('Current bus position');
    expect(within(items[3]).getByText('4 min')).toBeInTheDocument();
  });

  it('lets a rider follow their stop', async () => {
    render(<StopTimeline route={route} snapshot={snapshot} />);

    const stop = route.stops[3];
    await userEvent.click(
      screen.getByRole('button', { name: `Follow ${stop.name}` }),
    );

    expect(useSharingStore.getState().myStops[route.id]).toBe(stop.id);
  });
});
