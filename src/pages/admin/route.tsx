import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { LuEye } from '~/assets/icons';
import { AppHeader } from '~/components';
import { Button } from '~/components/ui/button';

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
  head: () => ({
    meta: [{ title: 'Manage routes | UTP Bus Tracker' }],
  }),
});

function AdminLayout() {
  return (
    <div className="page_padding mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
      <AppHeader>
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            <LuEye />
            Rider view
          </Link>
        </Button>
      </AppHeader>

      <main className="clamp-[mt,8,10] grow">
        <Outlet />
      </main>
    </div>
  );
}
