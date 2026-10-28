import { FALLBACK_SECTION, sectionAccentRgb } from "@/lib/sections";

/** The `:root` default accent (the "me" section). */
export const FALLBACK_ACCENT_RGB = sectionAccentRgb(FALLBACK_SECTION);

// Canvas can't read CSS vars, so callers read the resolved `--accent-rgb` once on mount.
export function readAccentRgb(el: Element | null): string {
  if (!el || typeof window === "undefined") return FALLBACK_ACCENT_RGB;
  const value = getComputedStyle(el).getPropertyValue("--accent-rgb").trim();
  return value || FALLBACK_ACCENT_RGB;
}

/** `rgb(r g b / a)` string from a triple — for canvas `fillStyle` / `strokeStyle`. */
export function accentRgba(rgb: string, alpha: number): string {
  return `rgb(${rgb} / ${alpha})`;
}

// Mix an accent toward white (t > 0) or black (t < 0) by |t|; spreads it across Tetris pieces.
export function accentMix(rgb: string, t: number): string {
  const [r, g, b] = rgb.split(/\s+/).map(Number);
  const target = t >= 0 ? 255 : 0;
  const k = Math.min(1, Math.abs(t));
  const mix = (c: number) => Math.round(c + (target - c) * k);
  return `rgb(${mix(r)} ${mix(g)} ${mix(b)})`;
}
