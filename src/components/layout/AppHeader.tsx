import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { LuBusFront } from '~/assets/icons';
import { cn } from '~/utils';

export const AppHeader = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <header className={cn('flex items-center justify-between gap-4', className)}>
    <Link to="/" className="flex items-center gap-2.5">
      <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-xl shadow-sm">
        <LuBusFront className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-semibold">UTP Bus Tracker</span>
        <span className="text-muted-foreground text-2xs block">
          Shared by the people on board
        </span>
      </span>
    </Link>
    {children}
  </header>
);
