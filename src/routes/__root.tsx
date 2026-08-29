/// <reference types="vite/client" />

import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { FooterBadge } from "@/components/layout/FooterBadge";
import { Navbar } from "@/components/layout/Navbar";
import { accentForPath } from "@/lib/navigation";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Gorkem Karyol",
      },
      {
        name: "description",
        content: "Personal portfolio of Gorkem Karyol.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://image.tmdb.org" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const accent = accentForPath(pathname);

  // `data-accent` on this wrapper is the source of truth and is set during
  // render, so it's correct on the server — no first-paint flash. It's mirrored
  // onto <html> in an effect (post-hydration, never during render — see the
  // PageShell comment for why) purely so the page-level ::-webkit-scrollbar,
  // which is painted above this wrapper, can track the section accent too.
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  return (
    <div className="flex min-h-screen flex-col" data-accent={accent}>
      <a href="#main-content" className="skip-link mono">
        Skip to content
      </a>
      <Navbar />
      <div className="flex-1 pt-[48px]">
        <Outlet />
      </div>
      <FooterBadge />
    </div>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
