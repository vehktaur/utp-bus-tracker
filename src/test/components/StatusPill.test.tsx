import { render, screen } from '@testing-library/react';
import StatusPill from '~/pages/track/-components/StatusPill';
import type { BusEstimate } from '~/types';

const estimate = (overrides: Partial<BusEstimate>): BusEstimate => ({
  status: 'live',
  position: null,
  heading: null,
  distanceAlong: null,
  speedMps: null,
  contributors: 0,
  devices: [],
  trip: null,
  lastLive: null,
  ...overrides,
});

describe('StatusPill', () => {
  it('shows how many people are sharing when live', () => {
    render(<StatusPill estimate={estimate({ contributors: 2 })} now={0} />);

    expect(screen.getByRole('status')).toHaveTextContent('Live· 2 sharing');
  });

  it('shows when the bus was last seen', () => {
    render(
      <StatusPill
        estimate={estimate({
          status: 'recent',
          lastLive: { distanceAlong: 0, speedMps: 0, at: 0 },
        })}
        now={45_000}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Last seen· 45s ago');
  });

  it('labels a timetable estimate clearly', () => {
    render(<StatusPill estimate={estimate({ status: 'estimated' })} now={0} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Estimated· from timetable',
    );
  });
});
