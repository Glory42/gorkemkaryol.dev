import { describe, expect, it } from "vitest";
import { fuzzyMatch, rankByQuery } from "@/features/palette/fuzzy";

describe("fuzzyMatch", () => {
  it("matches everything with no positions on an empty query", () => {
    expect(fuzzyMatch("", "projects")).toEqual({ score: 0, positions: [] });
  });

  it("returns null when the query is not a subsequence", () => {
    expect(fuzzyMatch("xyz", "projects")).toBeNull();
  });

  it("matches a case-insensitive subsequence and reports positions", () => {
    expect(fuzzyMatch("PJ", "projects")?.positions).toEqual([0, 3]);
  });

  it("prefers a contiguous run over a scattered one", () => {
    const run = fuzzyMatch("shel", "playground/shell")!;
    expect(run.positions).toEqual([11, 12, 13, 14]);
  });

  it("scores a word-start match above a mid-word one", () => {
    const start = fuzzyMatch("g", "games")!.score;
    const mid = fuzzyMatch("g", "playground")!.score;
    expect(start).toBeGreaterThan(mid);
  });

  it("ignores spaces in the query", () => {
    expect(fuzzyMatch("pl sh", "playground/shell")).not.toBeNull();
  });
});

describe("rankByQuery", () => {
  const items = ["me", "projects", "playground/shell", "playground/space"];

  it("keeps the original order on an empty query", () => {
    expect(rankByQuery(items, "", (s) => s).map((r) => r.item)).toEqual(items);
  });

  it("drops non-matches and sorts best first", () => {
    const ranked = rankByQuery(items, "shell", (s) => s).map((r) => r.item);
    expect(ranked).toEqual(["playground/shell"]);
  });

  it("breaks ties by shorter text", () => {
    const ranked = rankByQuery(["projects/huddin", "projects"], "proj", (s) => s);
    expect(ranked[0].item).toBe("projects");
  });
});
