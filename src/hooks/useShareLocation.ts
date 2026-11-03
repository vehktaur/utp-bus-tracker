import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSharingStore } from '~/store';
import { locationTransport } from '~/utils/locationTransport';
import { useWakeLock } from './useWakeLock';

/** Sharing ends on its own after this long, in case someone forgets */
const MAX_SHARING_MS = 2 * 60 * 60_000;

const geolocationErrorMessage = (error: GeolocationPositionError) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission was denied. Allow it in your browser settings to share.';
    case error.POSITION_UNAVAILABLE:
      return "Your phone couldn't get a GPS fix. Try moving near a window.";
    default:
      return 'Getting your location is taking longer than usual.';
  }
};

export const useShareLocation = (routeId: string) => {
  const {
    deviceId,
    role,
    sharingRouteId,
    sharingSince,
    startSharing,
    stopSharing,
  } = useSharingStore(
    useShallow((s) => ({
      deviceId: s.deviceId,
      role: s.role,
      sharingRouteId: s.sharingRouteId,
      sharingSince: s.sharingSince,
      startSharing: s.startSharing,
      stopSharing: s.stopSharing,
    })),
  );

  const isSharing = sharingRouteId === routeId;
  const isSharingElsewhere = !!sharingRouteId && !isSharing;
  const isSupported = 'geolocation' in navigator;

  const [error, setError] = useState<string | null>(null);
  const [lastFixAt, setLastFixAt] = useState<number | null>(null);
  const wakeLock = useWakeLock(isSharing);

  useEffect(() => {
    if (!isSharing || !isSupported) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        setError(null);
        setLastFixAt(timestamp);

        locationTransport.publish({
          deviceId,
          routeId,
          role,
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          timestamp,
        });

        if (sharingSince && timestamp - sharingSince > MAX_SHARING_MS) {
          stopSharing();
        }
      },
      (positionError) => {
        setError(geolocationErrorMessage(positionError));
        if (positionError.code === positionError.PERMISSION_DENIED) {
          stopSharing();
        }
      },
      { enableHighAccuracy: true, maximumAge: 2_000, timeout: 20_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [
    isSharing,
    isSupported,
    deviceId,
    role,
    routeId,
    sharingSince,
    stopSharing,
  ]);

  return {
    deviceId,
    isSharing,
    isSharingElsewhere,
    isSupported,
    error,
    lastFixAt,
    wakeLock,
    start: () => {
      setError(null);
      startSharing(routeId);
    },
    stop: stopSharing,
  };
};
