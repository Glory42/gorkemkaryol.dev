import type { GithubContributionDay } from "@/server/github/github";

// The grid shows the last 52 full weeks (52 * 7 = 364 days), oldest week first.
export const CONTRIBUTION_WEEKS = 52;
export const DAYS_PER_WEEK = 7;

/** Sort days oldest-first, keep the last 364, then group into 7-day weeks. */
export function buildContributionWeeks(
  days: GithubContributionDay[],
): GithubContributionDay[][] {
  const recent = days
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-CONTRIBUTION_WEEKS * DAYS_PER_WEEK);

  const weeks: GithubContributionDay[][] = [];
  for (let i = 0; i < recent.length; i += DAYS_PER_WEEK) {
    weeks.push(recent.slice(i, i + DAYS_PER_WEEK));
  }
  return weeks;
}

// SVG `fill=` can't resolve `var()`, so the ramp is built in JS from the section
// accent read on mount; level 0 stays a fixed white wash.
export function levelFill(accentRgb: string): Record<number, string> {
  return {
    0: "rgba(255,255,255,0.03)",
    1: `rgb(${accentRgb} / 0.18)`,
    2: `rgb(${accentRgb} / 0.38)`,
    3: `rgb(${accentRgb} / 0.62)`,
    4: `rgb(${accentRgb})`,
  };
}

export function formatContributionDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
