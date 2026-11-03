import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { LuLoaderCircle } from '~/assets/icons';
import { cn } from '~/utils';

const buttonVariants = cva(
  'focus-visible:ring-ring/50 aria-invalid:border-destructive flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-colors duration-300 outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/88',
        outline:
          'bg-card hover:bg-accent hover:text-accent-foreground border shadow-xs',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'clamp-[text,2xs,xs] px-3 py-1.5',
        md: 'clamp-[text,xs,2sm] px-4 py-2',
        lg: 'clamp-[text,sm,base] clamp-[py,3,3.5] px-5',
        icon: 'clamp-[size,9,10] rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading,
  children,
  disabled,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      disabled={disabled || isLoading}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {isLoading ? (
        <>
          <LuLoaderCircle className="animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
