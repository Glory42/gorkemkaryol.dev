export type AccentSlug =
  | "me"
  | "projects"
  | "experience"
  | "interests"
  | "playground";

// The `--accent-rgb` triple per section — mirrors the [data-accent] blocks in
// tokens.css. SVG / canvas paints can't read the CSS var at first paint, so
// they seed with the value for the section they render in.
export const ACCENT_RGB: Record<AccentSlug, string> = {
  me: "168 85 247",
  projects: "34 197 94",
  experience: "244 63 94",
  interests: "59 130 246",
  playground: "245 179 1",
};

/** The `:root` default accent (the "me" section). */
export const FALLBACK_ACCENT_RGB = ACCENT_RGB.me;

// Read the resolved `--accent-rgb` triple (e.g. "34 197 94") for an element.
// Canvas paints can't read the CSS var, so they call this once on mount and cache.
export function readAccentRgb(el: Element | null): string {
  if (!el || typeof window === "undefined") return FALLBACK_ACCENT_RGB;
  const value = getComputedStyle(el).getPropertyValue("--accent-rgb").trim();
  return value || FALLBACK_ACCENT_RGB;
}

/** `rgb(r g b / a)` string from a triple — for canvas `fillStyle` / `strokeStyle`. */
export function accentRgba(rgb: string, alpha: number): string {
  return `rgb(${rgb} / ${alpha})`;
}

// Mix an accent triple toward white (`t > 0`) or black (`t < 0`) by `|t|` in
// `[0, 1]`. Spreads one section accent across the Tetris piece palette.
export function accentMix(rgb: string, t: number): string {
  const [r, g, b] = rgb.split(/\s+/).map(Number);
  const target = t >= 0 ? 255 : 0;
  const k = Math.min(1, Math.abs(t));
  const mix = (c: number) => Math.round(c + (target - c) * k);
  return `rgb(${mix(r)} ${mix(g)} ${mix(b)})`;
}
