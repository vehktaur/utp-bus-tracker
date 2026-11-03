import { AxiosError } from 'axios';
import { cn, formatMinutesUntil, formatTimeAgo, getApiError } from '~/utils';

describe('formatMinutesUntil', () => {
  const now = 1_000_000;

  it.each([
    [-5_000, 'now'],
    [60_000, '1 min'],
    [12 * 60_000, '12 min'],
    [60 * 60_000, '1 h'],
    [65 * 60_000, '1 h 5 min'],
  ])('formats %i ms ahead as %s', (offset, expected) => {
    expect(formatMinutesUntil(now + offset, now)).toBe(expected);
  });
});

describe('formatTimeAgo', () => {
  it('reads naturally', () => {
    expect(formatTimeAgo(1_000, 5_000)).toBe('just now');
    expect(formatTimeAgo(0, 30_000)).toBe('30s ago');
    expect(formatTimeAgo(0, 180_000)).toBe('3 min ago');
  });
});

describe('cn', () => {
  it('merges conflicting classes, including tailwind-clamp ones', () => {
    expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4');
    expect(cn('clamp-[text,sm,base]', 'clamp-[text,lg,xl]')).toBe(
      'clamp-[text,lg,xl]',
    );
    const isHidden = false;
    expect(cn('bg-live', isHidden && 'hidden', 'bg-recent')).toBe('bg-recent');
  });
});

describe('getApiError', () => {
  it('prefers the API message, then falls back', () => {
    const error = new AxiosError('Request failed');
    error.response = {
      data: { message: 'Route not found' },
    } as AxiosError['response'];

    expect(getApiError(error)).toBe('Route not found');
    expect(getApiError(new Error(''), 'Fallback')).toBe('Fallback');
    expect(getApiError('nope', 'Fallback')).toBe('Fallback');
  });
});
