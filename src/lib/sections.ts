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

export interface Section {
  slug: SectionSlug;
  label: string;
  href: SectionHref;
  icon: LucideIcon;
  /** Plain hex, for CSS that just needs a colour. */
  accentHex: string;
  /** Space-separated channel triple for `rgb(… / a)` math and canvas paints. */
  accentRgb: string;
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
  },
  projects: {
    slug: "projects",
    label: "projects",
    href: "/projects",
    icon: FolderGit2,
    accentHex: "#22c55e",
    accentRgb: "34 197 94",
  },
  experience: {
    slug: "experience",
    label: "experience",
    href: "/experience",
    icon: Briefcase,
    accentHex: "#f43f5e",
    accentRgb: "244 63 94",
  },
  interests: {
    slug: "interests",
    label: "interests",
    href: "/interests",
    icon: Heart,
    accentHex: "#3b82f6",
    accentRgb: "59 130 246",
  },
  playground: {
    slug: "playground",
    label: "playground",
    href: "/playground",
    icon: GamepadDirectional,
    accentHex: "#f5b301",
    accentRgb: "245 179 1",
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
