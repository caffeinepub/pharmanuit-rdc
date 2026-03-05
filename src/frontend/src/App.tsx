import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AdminPage } from "./pages/AdminPage";
import { ConditionsPage } from "./pages/ConditionsPage";
import { HomePage } from "./pages/HomePage";
import { InscriptionPage } from "./pages/InscriptionPage";
import { LoginPage } from "./pages/LoginPage";
import { PharmacieDashboardPage } from "./pages/PharmacieDashboardPage";
import { PharmacyDetailPage } from "./pages/PharmacyDetailPage";

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
    </>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const pharmacieDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pharmacie/$id",
  component: PharmacyDetailPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const inscriptionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inscription",
  component: InscriptionPage,
});

const pharmacieDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pharmacie-dashboard",
  component: PharmacieDashboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const conditionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/conditions",
  component: ConditionsPage,
});

// Router
const routeTree = rootRoute.addChildren([
  indexRoute,
  pharmacieDetailRoute,
  loginRoute,
  inscriptionRoute,
  pharmacieDashboardRoute,
  adminRoute,
  conditionsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
