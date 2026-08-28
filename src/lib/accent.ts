export type AccentSlug = "me" | "projects" | "experience" | "interests" | "cool";

/** Matches the `:root` default in tokens.css (the "me" / purple accent). */
export const FALLBACK_ACCENT_RGB = "168 85 247";

/**
 * Read the resolved `--accent-rgb` triple (e.g. "34 197 94") for an element.
 *
 * Canvas paints and other JS-driven colours can't reference the CSS variable
 * directly, so they call this once on mount (passing a node inside the
 * `[data-accent]` wrapper) and cache the result.
 */
export function readAccentRgb(el: Element | null): string {
  if (!el || typeof window === "undefined") return FALLBACK_ACCENT_RGB;
  const value = getComputedStyle(el).getPropertyValue("--accent-rgb").trim();
  return value || FALLBACK_ACCENT_RGB;
}

/** `rgb(r g b / a)` string from a triple — for canvas `fillStyle` / `strokeStyle`. */
export function accentRgba(rgb: string, alpha: number): string {
  return `rgb(${rgb} / ${alpha})`;
}

/**
 * Mix an accent triple toward white (`t > 0`) or black (`t < 0`) by `|t|` in
 * `[0, 1]`. Used to spread one section accent across the Tetris piece palette.
 */
export function accentMix(rgb: string, t: number): string {
  const [r, g, b] = rgb.split(/\s+/).map(Number);
  const target = t >= 0 ? 255 : 0;
  const k = Math.min(1, Math.abs(t));
  const mix = (c: number) => Math.round(c + (target - c) * k);
  return `rgb(${mix(r)} ${mix(g)} ${mix(b)})`;
}
