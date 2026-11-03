import { useState } from 'react';
import { useInterval } from 'usehooks-ts';

export const useNow = (intervalMs = 60_000) => {
  const [now, setNow] = useState(() => Date.now());
  useInterval(() => setNow(Date.now()), intervalMs);
  return now;
};
