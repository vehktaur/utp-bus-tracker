import { useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { LuTriangleAlert } from '~/assets/icons';
import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { getApiError } from '~/utils';

export default function ErrorBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <main className="page_padding grid min-h-dvh place-items-center text-center">
      <section className="flex max-w-md flex-col items-center gap-3">
        <span className="bg-destructive/10 text-destructive grid size-14 place-items-center rounded-2xl">
          <LuTriangleAlert className="size-6" />
        </span>
        <Heading as="h1" size="title">
          Something went wrong
        </Heading>
        <p className="text-muted-foreground">{getApiError(error)}</p>
        <Button className="mt-3" onClick={() => router.invalidate()}>
          Try again
        </Button>
      </section>
    </main>
  );
}
