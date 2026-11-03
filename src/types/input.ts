import type { ComponentProps, ReactNode } from 'react';

export type Size = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<
  ComponentProps<'input'>,
  'prefix' | 'size'
> {
  label?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  classNames?: {
    root?: string;
    label?: string;
    input?: string;
  };
  size?: Size;
  error?: boolean;
  errorEl?: ReactNode;
}
