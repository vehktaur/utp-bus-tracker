export const formatClock = (epochMs: number) =>
  new Date(epochMs).toLocaleTimeString('en-MY', {
    hour: 'numeric',
    minute: '2-digit',
  });

/** "now", "1 min", "12 min", "1 h 5 min" */
export const formatMinutesUntil = (epochMs: number, now: number) => {
  const minutes = Math.round((epochMs - now) / 60_000);

  if (minutes <= 0) return 'now';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

export const formatTimeAgo = (epochMs: number, now: number) => {
  const seconds = Math.max(0, Math.round((now - epochMs) / 1000));

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  return `${Math.round(seconds / 60)} min ago`;
};
