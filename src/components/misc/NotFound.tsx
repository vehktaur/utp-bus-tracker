import { Link } from '@tanstack/react-router';
import { LuMapPin } from '~/assets/icons';
import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';

export default function NotFound() {
  return (
    <main className="page_padding grid min-h-dvh place-items-center text-center">
      <section className="flex flex-col items-center gap-3">
        <span className="bg-accent text-accent-foreground grid size-14 place-items-center rounded-2xl">
          <LuMapPin className="size-6" />
        </span>
        <Heading as="h1" size="title">
          That page took a wrong turn
        </Heading>
        <p className="text-muted-foreground">It isn’t on any of our routes.</p>
        <Button asChild className="mt-3">
          <Link to="/">Back to all routes</Link>
        </Button>
      </section>
    </main>
  );
}
