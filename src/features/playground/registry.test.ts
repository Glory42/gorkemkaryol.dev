import { describe, expect, it } from "vitest";
import { playgroundEntries, playgroundEntry } from "@/features/playground/registry";

describe("playgroundEntry", () => {
  it("looks an entry up by slug", () => {
    expect(playgroundEntry("games")?.title).toBe("games");
    expect(playgroundEntry("whoami")?.href).toBe("/playground/whoami");
  });

  it("returns undefined for an unknown slug", () => {
    expect(playgroundEntry("nope")).toBeUndefined();
  });
});

describe("playgroundEntries", () => {
  it("gives every live entry an href and leaves 'soon' entries routeless", () => {
    for (const entry of playgroundEntries) {
      if (entry.status === "live") expect(entry.href).toBeTruthy();
      else expect(entry.href).toBeUndefined();
    }
  });

  it("keeps slugs unique", () => {
    const slugs = playgroundEntries.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
