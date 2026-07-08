import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GithubContributionCalendar } from "@/server/github";

interface Props {
  username: string;
  calendar: GithubContributionCalendar | null;
}

interface Hover {
  date: string;
  count: number;
  x: number;
  y: number;
}

const GAP = 3;
const RADIUS = 2;
const FALLBACK_CELL = 11;

const LEVEL_FILL: Record<number, string> = {
  0: "rgba(255,255,255,0.03)",
  1: "rgba(168,85,247,0.18)",
  2: "rgba(168,85,247,0.38)",
  3: "rgba(168,85,247,0.62)",
  4: "#a855f7",
};

function formatPrettyDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ContributionGrid({ calendar }: Props) {
  const [hover, setHover] = useState<Hover | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sorting/grouping only depends on `calendar`, not on hover — memoize so a
  // pointermove-driven re-render (which fires many times a second while
  // hovering the graph) doesn't re-sort and re-group 364 days every time.
  const weeks = useMemo(() => {
    if (!calendar) return [];
    const sortedDays = calendar.days
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const days = sortedDays.slice(-364);
    const result: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [calendar]);

  if (!calendar) {
    return (
      <EmptyState
        title="No contribution activity"
        description="No contribution data was returned by GitHub for the selected period."
      />
    );
  }

  const totalContributions = new Intl.NumberFormat("en-US").format(
    calendar.totalContributions,
  );

  const CELL = containerWidth
    ? (containerWidth - (weeks.length - 1) * GAP) / weeks.length
    : FALLBACK_CELL;
  const width = containerWidth ?? weeks.length * (CELL + GAP) - GAP;
  const height = 7 * (CELL + GAP) - GAP;

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const target = e.target as Element;
    const rect = target.closest("rect[data-date]") as SVGRectElement | null;
    if (!rect || !wrapRef.current) {
      setHover(null);
      return;
    }
    const bounds = wrapRef.current.getBoundingClientRect();
    setHover({
      date: rect.getAttribute("data-date")!,
      count: Number(rect.getAttribute("data-count") || "0"),
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });
  };

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.4)] uppercase">
          ./projects/contributions —{" "}
          <span className="text-[rgba(168,85,247,0.65)]">{totalContributions}</span>
        </span>
        <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
      </div>

      <div ref={wrapRef} className="relative w-full" onPointerLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-auto w-full"
          role="img"
          aria-label={`${totalContributions} contributions in the last year`}
          onPointerMove={handleMove}
        >
          {weeks.map((week, wi) =>
            week.map((day, di) => (
              <rect
                key={day.date}
                x={wi * (CELL + GAP)}
                y={di * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={RADIUS}
                ry={RADIUS}
                fill={LEVEL_FILL[day.level]}
                data-date={day.date}
                data-count={day.count}
                className="transition-opacity duration-150 hover:opacity-80"
              />
            )),
          )}
        </svg>

        {hover && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full border border-[rgba(168,85,247,0.4)] bg-black px-2.5 py-1.5"
            style={{ left: hover.x, top: hover.y - 12 }}
          >
            <span className="mono whitespace-nowrap text-[10px] tracking-[0.02em]">
              <span className="font-semibold text-[var(--accent-iris)]">{hover.count}</span>{" "}
              <span className="text-[var(--text-2)]">
                {hover.count === 1 ? "contribution" : "contributions"} on{" "}
              </span>
              <span className="text-[var(--text-1)]">{formatPrettyDate(hover.date)}</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
