import type { LucideIcon } from "lucide-react";
import {
  SECTION_LIST,
  type SectionHref,
  type SectionSlug,
} from "@/lib/sections";

export interface NavigationItem {
  href: SectionHref;
  label: string;
  icon: LucideIcon;
  /** The section accent every route under `href` inherits. */
  slug: SectionSlug;
}

export const navigationItems: NavigationItem[] = SECTION_LIST.map((section) => ({
  href: section.href,
  label: section.label,
  icon: section.icon,
  slug: section.slug,
}));

// The nav item owning `pathname` — exact or a sub-route (`/projects/foo` →
// projects). `/` and unmatched paths return undefined.
function matchSection(pathname: string): NavigationItem | undefined {
  return navigationItems
    .filter((item) => item.href !== "/")
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
}

// Section accent slug for a pathname; unmatched (`/`, 404s) falls back to `me`.
export function accentForPath(pathname: string): SectionSlug {
  return matchSection(pathname)?.slug ?? "me";
}

// Href of the nav item to highlight for `pathname` — sub-routes keep their
// parent active. `/` highlights "me"; a 404 highlights nothing.
export function activeSectionHref(
  pathname: string,
): NavigationItem["href"] | undefined {
  if (pathname === "/") return "/";
  return matchSection(pathname)?.href;
}
