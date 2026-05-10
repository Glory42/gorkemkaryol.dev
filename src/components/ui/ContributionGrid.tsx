import { EmptyState } from "@/components/ui/EmptyState";
import type { GithubContributionCalendar } from "@/server/github";

interface Props {
  username: string;
  calendar: GithubContributionCalendar | null;
}

const LEVEL_BG: Record<number, string> = {
  0: "rgba(255,255,255,0.03)",
  1: "rgba(168,85,247,0.18)",
  2: "rgba(168,85,247,0.38)",
  3: "rgba(168,85,247,0.62)",
  4: "#a855f7",
};

function formatDayLabel(date: string, count: number) {
  const [year, month, day] = date.split("-").map(Number);
  const prettyDate = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const noun = count === 1 ? "contribution" : "contributions";
  return `${count} ${noun} on ${prettyDate}`;
}

export function ContributionGrid({ username, calendar }: Props) {
  if (!calendar) {
    return (
      <EmptyState
        title="No contribution activity"
        description="No contribution data was returned by GitHub for the selected period."
      />
    );
  }

  const profileUrl = username ? `https://github.com/${username}` : "https://github.com";

  const sortedDays = calendar.days
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const days = sortedDays.slice(-364);
  const weeks: (typeof days)[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const totalContributions = new Intl.NumberFormat("en-US").format(
    calendar.totalContributions,
  );

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.4)] uppercase">
          ./projects/contributions —{" "}
          <span className="text-[rgba(168,85,247,0.65)]">{totalContributions}</span>
        </span>
        <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
      </div>

      <div className="overflow-x-auto">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          minWidth: `${weeks.length * 13}px`,
          gap: "3px",
        }}
      >
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-rows-7"
            style={{ gap: "3px" }}
          >
            {week.map((day) => (
              <a
                key={day.date}
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={formatDayLabel(day.date, day.count)}
                aria-label={formatDayLabel(day.date, day.count)}
                className="focus-ring block aspect-square w-full rounded-[2px]"
                style={{ backgroundColor: LEVEL_BG[day.level] }}
              />
            ))}
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
