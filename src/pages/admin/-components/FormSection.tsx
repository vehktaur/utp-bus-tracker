import type { ReactNode } from 'react';
import { Heading } from '~/components/ui/heading';

export default function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-card clamp-[p,5,6] rounded-2xl border">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading as="h2">{title}</Heading>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
