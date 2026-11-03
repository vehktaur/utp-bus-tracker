# UTP Bus Tracker

Live locations for the UTP shuttle buses, which have no GPS tracker. The phones of the people on board become the tracker.

## Getting started

```bash
bun install
cp .env.example .env   # every key is optional
bun run dev            # http://localhost:4100
```

With no keys, the app uses a built-in mock API (localStorage) and draws a to-scale schematic map. Add `VITE_GOOGLE_MAPS_API_KEY` for Google Maps and `VITE_BASE_ENDPOINT` for a real backend.

| Command                      | What it does             |
| ---------------------------- | ------------------------ |
| `make dev` / `bun run dev`   | Dev server               |
| `make check`                 | Typecheck + lint + tests |
| `make test` / `bun run test` | Vitest (once / watch)    |
| `make build`                 | Production build (PWA)   |

TypeScript 7 runs `tsc` through the `@typescript/native` alias, while `typescript` stays on the TS 6 API package so typescript-eslint keeps working (see the [TS 7 release notes](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)).

## Demo it

Open a route and turn on **Demo mode** (20× works well for a presentation). It replays a trip with three riders:

- **Amina** rides one stop and stops sharing properly.
- **Daniel** gets on later but **forgets to stop sharing**. The tracker spots him leaving the route and ignores him.
- **Farah** picks up where Daniel left off, so the bus stays live.

For real sharing on one laptop, open the same route in two tabs and tap **I’m on this bus** in one. To share across phones, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Realtime broadcast only, no tables).

## How the tracking works

All of it lives in `src/utils/tracking` as pure functions, tested in `src/test/tracking`.

1. **Snap** each GPS fix onto the route line (`geo.ts`).
2. **Filter** phones that are stale, inaccurate, off the route, walking away from a stop, or left behind at one (`engine.ts`).
3. **Fuse** the phones that agree. The biggest group wins, a driver counts triple, and the bus sits at their median.
4. **Fall back** to extrapolating for 3 minutes after sharing stops, then to the timetable.
5. **ETA** each stop from remaining distance and smoothed speed (`eta.ts`).

## Project layout

```
src/
  pages/                 TanStack Router file routes (-components hold page parts)
  components/            AppHeader, BusMap, NotFound, ErrorBoundary + ui/ (shadcn)
  hooks/                 app-provider, queries/ (TanStack Query), tracking and sharing hooks
  store/                 zustand stores
  types/                 shared types
  utils/                 ApiUrl, appRequest, queryClient, queryEnum, helpers, constants,
                         schemas/ (zod), tracking/, mock/, locationTransport, tableFeatures
  styles/                index.css (layers), variables.css (tokens), tailwind.css
  test/                  Vitest + Testing Library + jest-dom
```

## Before showing the school

- The stops in `src/utils/mock/seed.ts` are **placeholders**. Ride each route once and use the locate button next to each stop on the admin page to record the real positions.
- Enter the real timetable on the admin page.
- Route lines are straight segments between stops. Record a GPS trace or use the Directions API for road-accurate lines.

Browsers pause GPS when the screen locks, so sharers keep the screen on (the app holds a wake lock). The driver's phone, mounted and charging, is the most reliable source. Capacitor can wrap the app for true background location later.
