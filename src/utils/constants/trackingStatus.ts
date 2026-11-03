import type { DeviceVerdict, TrackingStatus } from '~/types';

export const TRACKING_STATUS: Record<
  TrackingStatus,
  { label: string; color: string; text: string; bg: string; note: string }
> = {
  live: {
    label: 'Live',
    color: 'var(--live)',
    text: 'text-live',
    bg: 'bg-live',
    note: 'Live from phones on the bus.',
  },
  recent: {
    label: 'Last seen',
    color: 'var(--recent)',
    text: 'text-recent',
    bg: 'bg-recent',
    note: 'Sharing paused. Estimating from the last live position.',
  },
  estimated: {
    label: 'Estimated',
    color: 'var(--estimated)',
    text: 'text-estimated',
    bg: 'bg-estimated',
    note: 'Nobody on board is sharing yet, so this follows the timetable.',
  },
  idle: {
    label: 'Not running',
    color: 'var(--estimated)',
    text: 'text-muted-foreground',
    bg: 'bg-muted-foreground',
    note: '',
  },
};

export const DEVICE_VERDICTS: Record<
  DeviceVerdict,
  { label: string; variant: 'live' | 'recent' | 'outline' }
> = {
  'on-bus': { label: 'On the bus', variant: 'live' },
  walking: { label: 'Got off · walking', variant: 'recent' },
  'off-route': { label: 'Off the route', variant: 'recent' },
  stationary: { label: 'Left behind at a stop', variant: 'recent' },
  outlier: { label: 'Too far from the others', variant: 'recent' },
  'low-accuracy': { label: 'Weak GPS', variant: 'outline' },
  stale: { label: 'Stopped sharing', variant: 'outline' },
};
