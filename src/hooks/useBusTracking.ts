import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  BusRoute,
  LiveFix,
  LocationPing,
  SimulationClock,
  TrackingSnapshot,
} from '~/types';
import { locationTransport } from '~/utils/locationTransport';
import {
  buildRouteGeometry,
  computeStopEtas,
  createTripSimulation,
  defaultSharers,
  estimateBus,
  findActiveTrip,
  findNextTrip,
} from '~/utils/tracking';
import type { SimulatedSharer } from '~/utils/tracking';
import { simulatedNow } from './useSimulation';

/** Pings older than this, relative to a phone's latest, are dropped */
const HISTORY_MS = 5 * 60_000;

type PingHistory = Map<string, LocationPing[]>;

const addPing = (history: PingHistory, ping: LocationPing) => {
  const pings = history.get(ping.deviceId) ?? [];
  const latest = pings.at(-1);

  if (latest && latest.timestamp >= ping.timestamp) return;

  pings.push(ping);
  history.set(
    ping.deviceId,
    pings.filter((item) => ping.timestamp - item.timestamp <= HISTORY_MS),
  );
};

/** Listens for shared locations on a route, or replays a simulated trip */
export const useBusTracking = (
  route: BusRoute,
  simulation: SimulationClock | null,
) => {
  const geometry = useMemo(
    () => buildRouteGeometry(route.stops),
    [route.stops],
  );
  const historyRef = useRef<PingHistory>(new Map());
  const lastLiveRef = useRef<LiveFix | null>(null);
  const [snapshot, setSnapshot] = useState<TrackingSnapshot | null>(null);
  const sharers = useMemo<SimulatedSharer[]>(
    () => (simulation ? defaultSharers(route) : []),
    [simulation, route],
  );

  const isSimulating = !!simulation;

  useEffect(() => {
    historyRef.current = new Map();
    lastLiveRef.current = null;

    if (isSimulating) return;

    return locationTransport.subscribe(route.id, (ping) =>
      addPing(historyRef.current, ping),
    );
  }, [route.id, isSimulating]);

  useEffect(() => {
    const replay = simulation
      ? createTripSimulation({ route, geometry, trip: simulation.trip })
      : null;

    const tick = () => {
      const now = simulation ? simulatedNow(simulation) : Date.now();

      replay?.pingsAt(now).forEach((ping) => addPing(historyRef.current, ping));

      const estimate = estimateBus({
        route,
        geometry,
        pingsByDevice: historyRef.current,
        now,
        trip: simulation ? simulation.trip : findActiveTrip(route, now),
        lastLive: lastLiveRef.current,
      });
      lastLiveRef.current = estimate.lastLive;

      setSnapshot({
        now,
        estimate,
        etas: computeStopEtas(route, geometry, estimate, now),
        nextTrip: simulation ? null : findNextTrip(route, now),
      });
    };

    tick();
    const id = setInterval(tick, simulation ? 250 : 1_000);

    return () => clearInterval(id);
  }, [route, geometry, simulation]);

  return {
    geometry,
    snapshot,
    sharers,
    transportKind: locationTransport.kind,
  };
};
