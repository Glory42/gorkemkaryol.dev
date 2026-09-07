import { describe, expect, it } from "vitest";
import { accentMix, accentRgba, FALLBACK_ACCENT_RGB, readAccentRgb } from "@/lib/accent";

describe("FALLBACK_ACCENT_RGB", () => {
  it("is the me-section accent triple", () => {
    expect(FALLBACK_ACCENT_RGB).toBe("168 85 247");
  });
});

describe("accentRgba", () => {
  it("splices a triple and alpha into an rgb(r g b / a) string", () => {
    expect(accentRgba("34 197 94", 0.5)).toBe("rgb(34 197 94 / 0.5)");
  });
});

describe("accentMix", () => {
  it("returns the colour unchanged at t = 0", () => {
    expect(accentMix("100 100 100", 0)).toBe("rgb(100 100 100)");
  });

  it("mixes fully to white at t = 1 and to black at t = -1", () => {
    expect(accentMix("100 100 100", 1)).toBe("rgb(255 255 255)");
    expect(accentMix("100 100 100", -1)).toBe("rgb(0 0 0)");
  });

  it("mixes halfway toward white at t = 0.5", () => {
    expect(accentMix("100 100 100", 0.5)).toBe("rgb(178 178 178)");
  });

  it("clamps |t| to 1", () => {
    expect(accentMix("100 100 100", 4)).toBe("rgb(255 255 255)");
    expect(accentMix("100 100 100", -9)).toBe("rgb(0 0 0)");
  });

  it("mixes each channel independently", () => {
    expect(accentMix("0 128 255", -0.5)).toBe("rgb(0 64 128)");
  });
});

describe("readAccentRgb", () => {
  it("returns the fallback when there is no element", () => {
    expect(readAccentRgb(null)).toBe(FALLBACK_ACCENT_RGB);
  });

  it("returns the fallback off the DOM (no window)", () => {
    expect(readAccentRgb({} as Element)).toBe(FALLBACK_ACCENT_RGB);
  });
});
