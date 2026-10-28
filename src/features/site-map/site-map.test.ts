import { describe, expect, it } from "vitest";
import { playgroundEntries } from "@/features/playground/registry";
import { findPlace, places, sectionDirs } from "@/features/site-map/site-map";
import { SECTION_LIST } from "@/lib/sections";

describe("places", () => {
  it("lists every section, every sub-page and every live toy once", () => {
    const hrefs = places.map((p) => p.href);
    for (const section of SECTION_LIST) {
      expect(hrefs).toContain(section.href);
      for (const page of section.pages) expect(hrefs).toContain(page);
    }
    for (const entry of playgroundEntries) {
      if (entry.status === "live") expect(hrefs).toContain(entry.href);
    }
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("labels places the way the shell prints paths", () => {
    expect(places.find((p) => p.href === "/")?.label).toBe("~");
    expect(places.find((p) => p.href === "/interests/reading")?.label).toBe(
      "~/interests/reading",
    );
  });

  it("marks playground entries as toys and leaves 'soon' ones out", () => {
    expect(places.find((p) => p.href === "/playground/games")?.kind).toBe("toy");
    expect(places.some((p) => p.href.endsWith("/typing"))).toBe(false);
  });
});

describe("sectionDirs", () => {
  it("lists every section but home", () => {
    expect(sectionDirs).toEqual(["projects", "experience", "interests", "playground"]);
  });
});

describe("findPlace", () => {
  it("resolves home from every spelling", () => {
    for (const input of ["", "~", "/", "home", "~/"]) {
      expect(findPlace(input)?.href).toBe("/");
    }
  });

  it("resolves sections, sub-pages and toys, relative or absolute", () => {
    expect(findPlace("projects")?.href).toBe("/projects");
    expect(findPlace("./projects/")?.href).toBe("/projects");
    expect(findPlace("~/interests/reading")?.href).toBe("/interests/reading");
    expect(findPlace("/playground/shell")?.href).toBe("/playground/shell");
    expect(findPlace("Interests")?.href).toBe("/interests");
  });

  it("returns undefined for an unknown place", () => {
    expect(findPlace("nowhere")).toBeUndefined();
  });
});
