import { Briefcase, FolderGit2, Gamepad2, Heart, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AccentSlug } from "@/lib/accent";

export interface NavigationItem {
  href: "/" | "/projects" | "/interests" | "/experience" | "/cool";
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
  { href: "/cool", label: "cool", icon: Gamepad2, accent: "cool" },
];

/**
 * Resolve the section accent for a pathname. Sub-routes inherit their parent
 * section (`/projects/foo` → `projects`); anything unmatched — `/`, 404s —
 * falls back to `me` (the purple default in tokens.css).
 */
export function accentForPath(pathname: string): AccentSlug {
  const match = navigationItems
    .filter((item) => item.href !== "/")
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.accent ?? "me";
}
