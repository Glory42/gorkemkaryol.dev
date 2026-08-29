import { Briefcase, FolderGit2, Gamepad2, Heart, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AccentSlug } from "@/lib/accent";

export interface NavigationItem {
  href: "/" | "/projects" | "/interests" | "/experience" | "/playground";
  label: string;
  icon: LucideIcon;
  /** The section accent every route under `href` inherits. */
  accent: AccentSlug;
}

export const navigationItems: NavigationItem[] = [
  { href: "/", label: "me", icon: User, accent: "me" },
  { href: "/projects", label: "projects", icon: FolderGit2, accent: "projects" },
  { href: "/experience", label: "experience", icon: Briefcase, accent: "experience" },
  { href: "/interests", label: "interests", icon: Heart, accent: "interests" },
  { href: "/playground", label: "playground", icon: Gamepad2, accent: "playground" },
];

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

// Section accent for a pathname; unmatched (`/`, 404s) falls back to `me`.
export function accentForPath(pathname: string): AccentSlug {
  return matchSection(pathname)?.accent ?? "me";
}

// Href of the nav item to highlight for `pathname` — sub-routes keep their
// parent active. `/` highlights "me"; a 404 highlights nothing.
export function activeSectionHref(
  pathname: string,
): NavigationItem["href"] | undefined {
  if (pathname === "/") return "/";
  return matchSection(pathname)?.href;
}
