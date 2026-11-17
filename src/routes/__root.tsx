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
import { OG_IMAGE, personJsonLd, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    // Site-wide defaults; a route's pageHead() overrides the per-page title, description and URL.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#000000" },
      { title: SITE_NAME },
      { name: "description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: SITE_NAME },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: OG_IMAGE.url },
      { property: "og:image:width", content: String(OG_IMAGE.width) },
      { property: "og:image:height", content: String(OG_IMAGE.height) },
      { property: "og:image:alt", content: `${SITE_NAME}, software engineer` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE.url },
      { "script:ld+json": personJsonLd },
    ],
    links: [
      { rel: "preconnect", href: "https://image.tmdb.org" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
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
