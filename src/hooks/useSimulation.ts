import { useState } from 'react';
import type { BusRoute, SimulationClock } from '~/types';
import { tripDurationMinutes } from '~/utils/tracking';

export const SIMULATION_SPEEDS = [1, 5, 10, 20] as const;

export const simulatedNow = (clock: SimulationClock, real = Date.now()) =>
  clock.anchorSim + (real - clock.anchorReal) * clock.speed;

/** Replays a made-up trip on fast-forward so a demo never depends on a real bus */
export const useSimulation = (route: BusRoute) => {
  const [clock, setClock] = useState<SimulationClock | null>(null);

  const start = (speed = 10) => {
    const now = Date.now();
    const startsAt = now + 10_000;

    setClock({
      trip: {
        departure: 'Demo',
        startsAt,
        endsAt: startsAt + tripDurationMinutes(route) * 60_000,
      },
      speed,
      anchorReal: now,
      anchorSim: now,
    });
  };

  const setSpeed = (speed: number) =>
    setClock((current) => {
      if (!current) return current;

      const real = Date.now();
      return {
        ...current,
        speed,
        anchorReal: real,
        anchorSim: simulatedNow(current, real),
      };
    });

  return { clock, start, stop: () => setClock(null), setSpeed };
};
