import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '~/utils';

const headingVariants = cva('text-foreground font-semibold', {
  variants: {
    size: {
      display: 'clamp-[text,3xl,5xl] tracking-tight text-balance',
      page: 'clamp-[text,2xl,3xl] tracking-tight',
      title: 'clamp-[text,xl,2xl]',
      card: 'clamp-[text,base,lg]',
    },
  },
  defaultVariants: {
    size: 'card',
  },
});

type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4';

function Heading({
  as: Comp = 'h2',
  size,
  className,
  ...props
}: ComponentProps<'h2'> &
  VariantProps<typeof headingVariants> & { as?: HeadingElement }) {
  return (
    <Comp
      data-slot="heading"
      className={cn(headingVariants({ size, className }))}
      {...props}
    />
  );
}

export { Heading, headingVariants };
