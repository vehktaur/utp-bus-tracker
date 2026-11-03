import { useEffect, useState } from 'react';

/**
 * Keeps the screen awake while `active`. Browsers pause GPS when the screen
 * locks, so this is what keeps a sharer's location flowing on the web.
 */
export const useWakeLock = (active: boolean) => {
  const isSupported =
    typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!active || !isSupported) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) return void sentinel.release();

        setIsLocked(true);
        sentinel.addEventListener('release', () => setIsLocked(false));
      } catch {
        setIsLocked(false);
      }
    };

    // The lock drops whenever the tab is hidden; take it again on return.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      void sentinel?.release();
      setIsLocked(false);
    };
  }, [active, isSupported]);

  return { isSupported, isLocked };
};
