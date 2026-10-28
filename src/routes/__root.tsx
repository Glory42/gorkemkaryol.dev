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
import { CommandPalette } from "@/features/palette/CommandPalette";
import { accentForPath, sectionAccentCss } from "@/lib/sections";
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

  // `data-accent` here is the SSR source of truth; mirror it to <html> for the page scrollbar.
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
      <CommandPalette />
    </div>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Section accent custom-properties, generated from one registry. */}
        <style dangerouslySetInnerHTML={{ __html: sectionAccentCss() }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
