import { createRouter } from "@tanstack/react-router";
import { StatusPage } from "@/components/ui/StatusPage";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultErrorComponent: ({ error }) => (
      <StatusPage variant="error" message={error.message || undefined} />
    ),
    defaultNotFoundComponent: () => <StatusPage variant="not-found" />,
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
