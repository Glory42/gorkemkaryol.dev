import { createRouter } from "@tanstack/react-router";
import { StatusPage } from "@/components/ui/StatusPage";
import { NotFoundPage } from "@/features/not-found/NotFoundPage";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: ({ error }) => <StatusPage message={error.message || undefined} />,
    defaultNotFoundComponent: () => <NotFoundPage />,
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
