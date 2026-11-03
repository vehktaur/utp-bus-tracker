import { act, renderHook } from '@testing-library/react';
import { simulatedNow, useSimulation } from '~/hooks';
import { seedRoutes } from '~/utils/mock/seed';

describe('useSimulation', () => {
  afterEach(() => vi.useRealTimers());

  it('runs a demo clock that keeps time across speed changes', () => {
    vi.useFakeTimers({ now: 1_000_000 });
    const { result } = renderHook(() => useSimulation(seedRoutes[0]));

    act(() => result.current.start(10));
    const clock = result.current.clock!;
    expect(clock.trip.endsAt - clock.trip.startsAt).toBe(17 * 60_000);

    vi.setSystemTime(1_010_000);
    expect(simulatedNow(clock)).toBe(1_000_000 + 100_000);

    act(() => result.current.setSpeed(20));
    vi.setSystemTime(1_011_000);
    expect(simulatedNow(result.current.clock!)).toBe(1_000_000 + 120_000);

    act(() => result.current.stop());
    expect(result.current.clock).toBeNull();
  });
});
