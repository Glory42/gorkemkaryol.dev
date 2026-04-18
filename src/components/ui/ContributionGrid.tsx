import { EmptyState } from "@/components/ui/EmptyState";
import type { GithubContributionCalendar } from "@/server/github";

interface Props {
  username: string;
  calendar: GithubContributionCalendar | null;
}

const swatches: Record<number, string> = {
  0: "bg-[rgba(31,29,46,0.8)]",
  1: "bg-[rgba(49,116,143,0.2)]",
  2: "bg-[rgba(49,116,143,0.4)]",
  3: "bg-[rgba(49,116,143,0.65)]",
  4: "bg-[rgb(49,116,143)]",
};

function formatDayLabel(date: string, count: number) {
  const [year, month, day] = date.split("-").map(Number);
  const prettyDate = new Date(
    Date.UTC(year, month - 1, day),
  ).toLocaleDateString("en-US", {
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

  const profileUrl = username
    ? `https://github.com/${username}`
    : "https://github.com";

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
      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border border-[rgba(64,61,82,0.7)] bg-[rgba(31,29,46,0.45)] px-5 py-4">
        <span className="pointer-events-none absolute left-0 top-0 h-[6px] w-[6px] border-l border-t border-[rgba(49,116,143,0.25)]" />
        <span className="pointer-events-none absolute right-0 top-0 h-[6px] w-[6px] border-r border-t border-[rgba(49,116,143,0.25)]" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-[6px] w-[6px] border-b border-l border-[rgba(49,116,143,0.25)]" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-[6px] w-[6px] border-b border-r border-[rgba(49,116,143,0.25)]" />

        <div className="flex items-center gap-3.5">
          <span className="mono text-[10px] tracking-[0.15em] text-[rgba(49,116,143,0.6)]">
            /contributions
          </span>
          <span className="h-[14px] w-px bg-[rgba(64,61,82,0.9)]" />
          <span className="mono text-[10px] text-[rgba(224,222,244,0.65)]">
            <span className="font-bold text-[rgb(156,207,216)]">
              {totalContributions}
            </span>{" "}
            contributions in the last year
          </span>
        </div>

        <div className="flex items-center gap-[5px]">
          <span className="mono text-[8px] text-[rgba(110,106,134,0.55)]">
            Less
          </span>
          <span className="h-[10px] w-[10px] bg-[rgba(31,29,46,0.8)]" />
          <span className="h-[10px] w-[10px] bg-[rgba(49,116,143,0.2)]" />
          <span className="h-[10px] w-[10px] bg-[rgba(49,116,143,0.4)]" />
          <span className="h-[10px] w-[10px] bg-[rgba(49,116,143,0.65)]" />
          <span className="h-[10px] w-[10px] bg-[rgb(49,116,143)]" />
          <span className="mono text-[8px] text-[rgba(110,106,134,0.55)]">
            More
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[820px]">
          <div
            className="grid w-full gap-[4px]"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >
            {weeks.map((week, weekIndex) => (
              <div
                key={`week-${weekIndex}`}
                className="grid grid-rows-7 gap-[4px]"
              >
                {week.map((day) => (
                  <a
                    key={day.date}
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={formatDayLabel(day.date, day.count)}
                    aria-label={formatDayLabel(day.date, day.count)}
                    className={`focus-ring block aspect-square w-full border border-[rgba(64,61,82,0.6)] ${swatches[day.level]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
