import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { withTailwindClamp } from 'tailwind-clamp-merge';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge(
  {
    extend: {
      theme: {
        color: ['live', 'recent', 'estimated'],
        text: ['xxs', '2xs', '2sm'],
      },
    },
  },
  withTailwindClamp,
);

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
