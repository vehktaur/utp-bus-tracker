import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { LuArrowRight, LuSettings2 } from '~/assets/icons';
import { AppHeader } from '~/components';
import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { Skeleton } from '~/components/ui/skeleton';
import { busRoutesQueryOptions, useBusRoutes, useNow } from '~/hooks';
import type { RouteDirection } from '~/types';
import HowItWorks from './-components/HowItWorks';
import RouteCard from './-components/RouteCard';

export const Route = createFileRoute('/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(busRoutesQueryOptions),
  component: HomePage,
});

const DIRECTIONS: { direction: RouteDirection; title: string }[] = [
  { direction: 'to-campus', title: 'To campus' },
  { direction: 'from-campus', title: 'From campus' },
];

function HomePage() {
  const { data: routes, isPending } = useBusRoutes();
  const now = useNow(30_000);

  return (
    <div className="page_padding mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <AppHeader>
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin">
            <LuSettings2 />
            Manage
          </Link>
        </Button>
      </AppHeader>

      <main className="grow">
        <section className="clamp-[mt,8,12] clamp-[mb,6,8]">
          <Heading as="h1" size="display">
            Where’s the bus?
          </Heading>
          <p className="text-muted-foreground clamp-[text,base,lg] mt-2 max-w-lg">
            Pick your route to see where the shuttle is right now and when it
            reaches your stop.
          </p>
        </section>

        {DIRECTIONS.map(({ direction, title }) => (
          <section
            key={direction}
            className="mb-8"
            aria-labelledby={`${direction}-heading`}
          >
            <h2 id={`${direction}-heading`} className="section_label mb-3">
              {title}
            </h2>

            <ul className="grid gap-3 sm:grid-cols-2">
              {isPending
                ? Array.from({ length: 2 }, (_, index) => (
                    <li key={index}>
                      <Skeleton className="h-36 rounded-2xl" />
                    </li>
                  ))
                : routes
                    ?.filter((route) => route.direction === direction)
                    .map((route, index) => (
                      <motion.li
                        key={route.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                      >
                        <RouteCard route={route} now={now} />
                      </motion.li>
                    ))}
            </ul>
          </section>
        ))}

        <HowItWorks />
      </main>

      <footer className="text-muted-foreground mt-8 flex items-center justify-between text-xs">
        <span>Prototype · sample routes</span>
        <Link
          to="/admin"
          className="hover:text-foreground inline-flex items-center gap-1"
        >
          Edit routes and timetables <LuArrowRight className="size-3" />
        </Link>
      </footer>
    </div>
  );
}
