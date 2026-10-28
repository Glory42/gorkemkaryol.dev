import { playgroundEntries } from "@/features/playground/registry";
import { SECTION_LIST } from "@/lib/sections";

// Every place a visitor can jump to by name; the palette lists them, the shell `cd`s into them.
export interface Place {
  href: string;
  /** The path as the shell prints it: `~`, `~/projects`, `~/interests/reading`. */
  label: string;
  kind: "page" | "toy";
}

const tilde = (href: string) => `~${href === "/" ? "" : href}`;

export const places: Place[] = [
  ...SECTION_LIST.flatMap((section) =>
    [section.href, ...section.pages].map((href) => ({
      href,
      label: tilde(href),
      kind: "page" as const,
    })),
  ),
  ...playgroundEntries.flatMap((entry) =>
    entry.status === "live" && entry.href
      ? [{ href: entry.href, label: tilde(entry.href), kind: "toy" as const }]
      : [],
  ),
];

/** Section directory names (home excluded), for the shell's `ls` and `help`. */
export const sectionDirs: string[] = SECTION_LIST.filter(
  (section) => section.href !== "/",
).map((section) => section.slug);

// Resolve a `cd` argument (`projects`, `./projects`, `~/interests/reading`, `/`, `home`, empty).
export function findPlace(input: string): Place | undefined {
  const path = input
    .trim()
    .replace(/^~/, "")
    .replace(/^\.\//, "")
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
  const href = path === "" || path === "home" ? "/" : `/${path}`;
  return places.find((place) => place.href.toLowerCase() === href);
}
