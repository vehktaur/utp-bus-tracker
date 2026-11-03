import { LuHand, LuRadio, LuSmartphone } from '~/assets/icons';
import { Heading } from '~/components/ui/heading';

const STEPS = [
  {
    Icon: LuHand,
    title: 'Get on the bus',
    text: 'Open the app and pick your route.',
  },
  {
    Icon: LuSmartphone,
    title: 'Tap “I’m on this bus”',
    text: 'Your phone quietly shares where the bus is.',
  },
  {
    Icon: LuRadio,
    title: 'Everyone sees it live',
    text: 'Anyone waiting gets a real ETA, not a guess.',
  },
];

export default function HowItWorks() {
  return (
    <section className="card mt-4" aria-labelledby="how-heading">
      <Heading id="how-heading">How it works</Heading>
      <p className="text-muted-foreground mt-1 text-sm">
        The bus has no GPS tracker, so the people on it become the tracker.
      </p>

      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ Icon, title, text }, index) => (
          <li key={title} className="flex gap-3 sm:flex-col">
            <span className="bg-accent text-accent-foreground relative grid size-11 shrink-0 place-items-center rounded-2xl">
              <Icon className="size-5" />
              <span className="bg-primary text-primary-foreground text-xxs absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full font-semibold">
                {index + 1}
              </span>
            </span>
            <span>
              <span className="block text-sm font-medium">{title}</span>
              <span className="text-muted-foreground block text-sm">
                {text}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
