import { describe, expect, it } from "vitest";
import { accentForPath, activeSectionHref } from "@/lib/navigation";
import {
  SECTIONS,
  SECTION_LIST,
  sectionAccentCss,
  sectionAccentRgb,
} from "@/lib/sections";

describe("sectionAccentCss", () => {
  const css = sectionAccentCss();

  it("emits a :root default from the me section", () => {
    expect(css).toContain(":root{--accent:#a855f7;--accent-rgb:168 85 247}");
  });

  it("emits a matching [data-accent] block for every section", () => {
    for (const section of SECTION_LIST) {
      expect(css).toContain(
        `[data-accent="${section.slug}"]{--accent:${section.accentHex};--accent-rgb:${section.accentRgb}}`,
      );
    }
  });
});

describe("sectionAccentRgb", () => {
  it("returns the channel triple for a slug", () => {
    expect(sectionAccentRgb("projects")).toBe("34 197 94");
    expect(sectionAccentRgb("playground")).toBe(SECTIONS.playground.accentRgb);
  });
});

describe("accentForPath", () => {
  it("maps a sub-route to its section", () => {
    expect(accentForPath("/projects/foo")).toBe("projects");
    expect(accentForPath("/interests")).toBe("interests");
  });

  it("falls back to me for / and unknown paths", () => {
    expect(accentForPath("/")).toBe("me");
    expect(accentForPath("/nope")).toBe("me");
  });
});

describe("activeSectionHref", () => {
  it("keeps a sub-route's parent active", () => {
    expect(activeSectionHref("/playground/games")).toBe("/playground");
  });

  it("returns / for home and undefined for a 404", () => {
    expect(activeSectionHref("/")).toBe("/");
    expect(activeSectionHref("/nope")).toBeUndefined();
  });
});
