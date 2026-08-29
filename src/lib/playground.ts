import {
  Fingerprint,
  Gamepad2,
  Music2,
  Rocket,
  SquareTerminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// One entry per thing living under /playground. The hub maps over this list and
// each route re-reads its entry for the page title and crumb.
export interface PlaygroundEntry {
  slug: string;
  href?:
    | "/playground/games"
    | "/playground/space"
    | "/playground/sysinfo"
    | "/playground/whoami";
  title: string;
  blurb: string;
  icon: LucideIcon;
  /** "soon" renders on the hub greyed out and needs no route file yet. */
  status: "live" | "soon";
}

export const playgroundEntries: PlaygroundEntry[] = [
  {
    slug: "games",
    href: "/playground/games",
    title: "games",
    blurb: "Snake, Flappy Bird, and Tetris, hand-built on a canvas.",
    icon: Gamepad2,
    status: "live",
  },
  {
    slug: "space",
    href: "/playground/space",
    title: "space",
    blurb:
      "NASA's picture of the day and the asteroids passing close to Earth today.",
    icon: Rocket,
    status: "live",
  },
  {
    slug: "sysinfo",
    href: "/playground/sysinfo",
    title: "sysinfo",
    blurb: "uptime, load average, and a classic.",
    icon: Music2,
    status: "live",
  },
  {
    slug: "whoami",
    href: "/playground/whoami",
    title: "whoami",
    blurb: "what the Cloudflare edge can tell about your connection.",
    icon: Fingerprint,
    status: "live",
  },
  {
    slug: "shell",
    title: "shell",
    blurb: "a real prompt, the way the rest of the site only pretends to be one.",
    icon: SquareTerminal,
    status: "soon",
  },
];

export function playgroundEntry(slug: string): PlaygroundEntry | undefined {
  return playgroundEntries.find((entry) => entry.slug === slug);
}
