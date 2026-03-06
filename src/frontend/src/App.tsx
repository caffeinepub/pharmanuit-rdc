import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { DisclaimerModal, useDisclaimer } from "./components/DisclaimerModal";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminPage } from "./pages/AdminPage";
import { ConditionsPage } from "./pages/ConditionsPage";
import { HomePage } from "./pages/HomePage";
import { InscriptionPage } from "./pages/InscriptionPage";
import { LoginPage } from "./pages/LoginPage";
import { PharmacieDashboardPage } from "./pages/PharmacieDashboardPage";
import { PharmacienLoginPage } from "./pages/PharmacienLoginPage";
import { PharmacyDetailPage } from "./pages/PharmacyDetailPage";

// Root layout with disclaimer modal
function RootLayout() {
  const { accepted, accept } = useDisclaimer();

  return (
    <>
      {!accepted && <DisclaimerModal onAccept={accept} />}
      <Outlet />
      <Toaster position="top-center" richColors />
    </>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: RootLayout,
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

// Pharmacist-only login (linked from the public "Espace Pharmacien" button)
const pharmacienLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pharmacien-login",
  component: PharmacienLoginPage,
});

// Hidden admin entry point — not linked anywhere in the public UI
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-pharmanuit-dashboard",
  component: AdminLoginPage,
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
  pharmacienLoginRoute,
  adminLoginRoute,
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
