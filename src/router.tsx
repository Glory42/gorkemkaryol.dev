import { createRouter } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/ui/DefaultCatchBoundary";
import { NotFound } from "@/components/ui/NotFound";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
