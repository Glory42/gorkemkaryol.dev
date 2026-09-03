import { describe, expect, it } from "vitest";
import {
  buildContributionWeeks,
  CONTRIBUTION_WEEKS,
  DAYS_PER_WEEK,
  formatContributionDate,
  levelFill,
} from "@/features/projects/contribution-weeks";
import type { GithubContributionDay } from "@/server/github/github";

function daysFrom(start: string, count: number): GithubContributionDay[] {
  const base = new Date(`${start}T00:00:00Z`).getTime();
  return Array.from({ length: count }, (_, i) => ({
    date: new Date(base + i * 86_400_000).toISOString().slice(0, 10),
    count: i,
    level: (i % 5) as 0 | 1 | 2 | 3 | 4,
  }));
}

describe("buildContributionWeeks", () => {
  it("returns no weeks for an empty calendar", () => {
    expect(buildContributionWeeks([])).toEqual([]);
  });

  it("sorts oldest-first and groups into 7-day weeks", () => {
    const weeks = buildContributionWeeks(daysFrom("2026-01-01", 14).reverse());
    expect(weeks).toHaveLength(2);
    expect(weeks[0].map((d) => d.date)[0]).toBe("2026-01-01");
    expect(weeks[0]).toHaveLength(DAYS_PER_WEEK);
    expect(weeks[1][0].date).toBe("2026-01-08");
  });

  it("keeps only the most recent 364 days", () => {
    const weeks = buildContributionWeeks(daysFrom("2025-01-01", 400));
    expect(weeks).toHaveLength(CONTRIBUTION_WEEKS);
    expect(weeks.flat()).toHaveLength(CONTRIBUTION_WEEKS * DAYS_PER_WEEK);
    // 400 - 364 = 36 days dropped from the front.
    expect(weeks[0][0].date).toBe("2025-02-06");
  });

  it("leaves a short final week partial", () => {
    const weeks = buildContributionWeeks(daysFrom("2026-01-01", 10));
    expect(weeks.map((w) => w.length)).toEqual([7, 3]);
  });
});

describe("levelFill", () => {
  it("keeps level 0 a fixed wash and ramps 1-4 on the accent", () => {
    const fills = levelFill("10 20 30");
    expect(fills[0]).toBe("rgba(255,255,255,0.03)");
    expect(fills[1]).toBe("rgb(10 20 30 / 0.18)");
    expect(fills[4]).toBe("rgb(10 20 30)");
  });
});

describe("formatContributionDate", () => {
  it("formats an ISO date as a US short date", () => {
    expect(formatContributionDate("2026-01-05")).toBe("Jan 5, 2026");
  });
});
