import {
  Briefcase,
  FolderGit2,
  GamepadDirectional,
  Heart,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SectionSlug =
  | "me"
  | "projects"
  | "experience"
  | "interests"
  | "playground";

export type SectionHref =
  | "/"
  | "/projects"
  | "/experience"
  | "/interests"
  | "/playground";

/** Fixed pages under a section, beyond its index. */
export type SubPageHref = "/interests/reading" | "/interests/watching";

export interface Section {
  slug: SectionSlug;
  label: string;
  href: SectionHref;
  icon: LucideIcon;
  /** Plain hex, for CSS that just needs a colour. */
  accentHex: string;
  /** Space-separated channel triple for `rgb(… / a)` math and canvas paints. */
  accentRgb: string;
  pages: SubPageHref[];
}

// The one place a section is defined: its nav entry, its route prefix, and its
// accent. tokens.css no longer hand-maintains the accent — __root.tsx emits it
// from sectionAccentCss() so the palette has a single source.
export const SECTIONS: Record<SectionSlug, Section> = {
  me: {
    slug: "me",
    label: "me",
    href: "/",
    icon: User,
    accentHex: "#a855f7",
    accentRgb: "168 85 247",
    pages: [],
  },
  projects: {
    slug: "projects",
    label: "projects",
    href: "/projects",
    icon: FolderGit2,
    accentHex: "#22c55e",
    accentRgb: "34 197 94",
    pages: [],
  },
  experience: {
    slug: "experience",
    label: "experience",
    href: "/experience",
    icon: Briefcase,
    accentHex: "#f43f5e",
    accentRgb: "244 63 94",
    pages: [],
  },
  interests: {
    slug: "interests",
    label: "interests",
    href: "/interests",
    icon: Heart,
    accentHex: "#3b82f6",
    accentRgb: "59 130 246",
    pages: ["/interests/reading", "/interests/watching"],
  },
  playground: {
    slug: "playground",
    label: "playground",
    href: "/playground",
    icon: GamepadDirectional,
    accentHex: "#f5b301",
    accentRgb: "245 179 1",
    pages: [],
  },
};

/** Sections in nav order. */
export const SECTION_LIST: Section[] = [
  SECTIONS.me,
  SECTIONS.projects,
  SECTIONS.experience,
  SECTIONS.interests,
  SECTIONS.playground,
];

/** The section a path with no match falls back to (`/`, 404s). */
export const FALLBACK_SECTION: SectionSlug = "me";

// The section owning `pathname`, exact or a sub-route (`/projects/foo` →
// projects). `/` and unmatched paths return undefined.
function matchSection(pathname: string): Section | undefined {
  return SECTION_LIST.find(
    (s) =>
      s.href !== "/" &&
      (pathname === s.href || pathname.startsWith(`${s.href}/`)),
  );
}

/** Section accent for a pathname; `/` and 404s get the fallback. */
export function accentForPath(pathname: string): SectionSlug {
  return matchSection(pathname)?.slug ?? FALLBACK_SECTION;
}

// Href of the nav item to highlight for `pathname`: sub-routes keep their
// parent active, `/` highlights "me", a 404 highlights nothing.
export function activeSectionHref(pathname: string): SectionHref | undefined {
  if (pathname === "/") return "/";
  return matchSection(pathname)?.href;
}

/** The `--accent-rgb` triple for a section — for canvas/SVG paints. */
export function sectionAccentRgb(slug: SectionSlug): string {
  return SECTIONS[slug].accentRgb;
}

// The `:root` default plus one `[data-accent="…"]` block per section, as CSS
// text. __root.tsx renders this in a <style> so tokens.css is not a hand-kept
// mirror of the same values.
export function sectionAccentCss(): string {
  const block = (selector: string, s: Section) =>
    `${selector}{--accent:${s.accentHex};--accent-rgb:${s.accentRgb}}`;

  return [
    block(":root", SECTIONS[FALLBACK_SECTION]),
    ...SECTION_LIST.map((s) => block(`[data-accent="${s.slug}"]`, s)),
  ].join("");
}
