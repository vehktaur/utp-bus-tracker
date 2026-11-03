import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IMaybe, SharerRole } from '~/types';
import { SHARING_STORAGE_KEY } from '~/utils';

interface SharingState {
  /** Random per device, never tied to a name */
  deviceId: string;
  role: SharerRole;
  sharingRouteId: IMaybe<string>;
  sharingSince: IMaybe<number>;
  /** The stop each rider follows, keyed by route id */
  myStops: Record<string, string>;
  setRole: (role: SharerRole) => void;
  startSharing: (routeId: string) => void;
  stopSharing: () => void;
  toggleMyStop: (routeId: string, stopId: string) => void;
}

const newDeviceId = () =>
  'randomUUID' in crypto
    ? crypto.randomUUID()
    : `device-${Math.random().toString(36).slice(2)}`;

export const useSharingStore = create<SharingState>()(
  persist(
    (set) => ({
      deviceId: newDeviceId(),
      role: 'rider',
      sharingRouteId: null,
      sharingSince: null,
      myStops: {},

      setRole: (role) => set({ role }),

      startSharing: (routeId) =>
        set({ sharingRouteId: routeId, sharingSince: Date.now() }),

      stopSharing: () => set({ sharingRouteId: null, sharingSince: null }),

      toggleMyStop: (routeId, stopId) =>
        set(({ myStops }) => {
          const { [routeId]: current, ...rest } = myStops;
          return {
            myStops: current === stopId ? rest : { ...rest, [routeId]: stopId },
          };
        }),
    }),
    {
      name: SHARING_STORAGE_KEY,
      // Sharing never resumes by itself after a reload
      partialize: ({ deviceId, role, myStops }) => ({
        deviceId,
        role,
        myStops,
      }),
    },
  ),
);
