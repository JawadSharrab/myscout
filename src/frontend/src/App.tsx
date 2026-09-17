import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
import { AccountProvider } from "@/hooks/useAccount";
import { SavedProvider } from "@/hooks/useSaved";
import { AccountPage } from "@/pages/Account";
import { AccountSettingsPage } from "@/pages/AccountSettings";
import { CreateEventPage } from "@/pages/CreateEvent";
import { DiscoverPage } from "@/pages/Discover";
import { MapPage } from "@/pages/Map";
import { NotFoundPage } from "@/pages/NotFound";
import { OpportunityDetailPage } from "@/pages/OpportunityDetail";
import { SavedPage } from "@/pages/Saved";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";

const rootRoute = createRootRoute({
  component: () => (
    <AccountProvider>
      <SavedProvider>
        <Layout>
          <Outlet />
        </Layout>
      </SavedProvider>
    </AccountProvider>
  ),
  notFoundComponent: NotFoundPage,
});

const discoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DiscoverPage,
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/map",
  component: MapPage,
});

const opportunityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/opportunity/$id",
  component: OpportunityDetailPage,
});

const savedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/saved",
  component: SavedPage,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: AccountPage,
});

const accountSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/settings",
  component: AccountSettingsPage,
});

const createEventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-event",
  component: CreateEventPage,
});

const routeTree = rootRoute.addChildren([
  discoverRoute,
  mapRoute,
  opportunityRoute,
  savedRoute,
  accountRoute,
  accountSettingsRoute,
  createEventRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
