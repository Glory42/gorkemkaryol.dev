import { describe, expect, it } from "vitest";
import { playgroundEntries } from "@/features/playground/registry";

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
