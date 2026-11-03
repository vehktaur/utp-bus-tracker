import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { LocationPing, TransportKind } from '~/types';

type PingListener = (ping: LocationPing) => void;

export interface LocationTransport {
  /** local only reaches other tabs on this device, supabase reaches every phone */
  readonly kind: TransportKind;
  publish: (ping: LocationPing) => void;
  subscribe: (routeId: string, listener: PingListener) => () => void;
}

/** Keeps listeners per route and fans pings out to them. */
const createListenerRegistry = () => {
  const listeners = new Map<string, Set<PingListener>>();

  return {
    add: (routeId: string, listener: PingListener) => {
      const set = listeners.get(routeId) ?? new Set();
      set.add(listener);
      listeners.set(routeId, set);

      return () => {
        set.delete(listener);
        if (set.size === 0) listeners.delete(routeId);
      };
    },
    count: (routeId: string) => listeners.get(routeId)?.size ?? 0,
    emit: (ping: LocationPing) =>
      listeners.get(ping.routeId)?.forEach((listener) => listener(ping)),
  };
};

/** Works across tabs on one device. Good for demos and development. */
const createLocalTransport = (): LocationTransport => {
  const registry = createListenerRegistry();
  const channel =
    typeof BroadcastChannel === 'undefined'
      ? null
      : new BroadcastChannel('utp-bus-tracker:pings');

  channel?.addEventListener('message', (event: MessageEvent<LocationPing>) =>
    registry.emit(event.data),
  );

  return {
    kind: 'local',
    publish: (ping) => {
      registry.emit(ping);
      channel?.postMessage(ping);
    },
    subscribe: registry.add,
  };
};

/** Broadcast-only Supabase Realtime: no tables needed, nothing is stored. */
const createSupabaseTransport = (
  url: string,
  anonKey: string,
): LocationTransport => {
  const client = createClient(url, anonKey);
  const registry = createListenerRegistry();
  const channels = new Map<string, RealtimeChannel>();

  const channelFor = (routeId: string) => {
    const existing = channels.get(routeId);
    if (existing) return existing;

    const channel = client
      .channel(`route:${routeId}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'ping' }, ({ payload }) =>
        registry.emit(payload as LocationPing),
      )
      .subscribe();

    channels.set(routeId, channel);
    return channel;
  };

  const release = (routeId: string) => {
    const channel = channels.get(routeId);
    if (!channel || registry.count(routeId) > 0) return;

    void client.removeChannel(channel);
    channels.delete(routeId);
  };

  return {
    kind: 'supabase',
    publish: (ping) => {
      registry.emit(ping);
      void channelFor(ping.routeId).send({
        type: 'broadcast',
        event: 'ping',
        payload: ping,
      });
    },
    subscribe: (routeId, listener) => {
      const remove = registry.add(routeId, listener);
      channelFor(routeId);

      return () => {
        remove();
        release(routeId);
      };
    },
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  string | undefined;

export const locationTransport: LocationTransport =
  supabaseUrl && supabaseKey
    ? createSupabaseTransport(supabaseUrl, supabaseKey)
    : createLocalTransport();
