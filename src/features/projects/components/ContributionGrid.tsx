import { useEffect, useMemo, useRef, useState } from "react";
import { StatusPanel } from "@/components/ui/StatusPanel";
import {
  buildContributionWeeks,
  formatContributionDate,
  levelFill,
} from "@/features/projects/contribution-weeks";
import { FALLBACK_ACCENT_RGB, readAccentRgb } from "@/lib/accent";
import type { GithubContributionCalendar } from "@/server/github/github";

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

export function ContributionGrid({ calendar }: Props) {
  const [hover, setHover] = useState<Hover | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [accentRgb, setAccentRgb] = useState(FALLBACK_ACCENT_RGB);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccentRgb(readAccentRgb(wrapRef.current));
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fills = useMemo(() => levelFill(accentRgb), [accentRgb]);

  // Memoized on `calendar` alone so pointermove re-renders don't re-sort and
  // re-group 364 days many times a second while hovering.
  const weeks = useMemo(
    () => (calendar ? buildContributionWeeks(calendar.days) : []),
    [calendar],
  );

  if (!calendar) {
    return (
      <StatusPanel tone="empty"
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
        <span className="mono text-[9px] tracking-[0.25em] text-accent/[0.4] uppercase">
          ./projects/contributions —{" "}
          <span className="text-accent/[0.65]">{totalContributions}</span>
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
                fill={fills[day.level]}
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
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full border border-accent/[0.4] bg-black px-2.5 py-1.5"
            style={{ left: hover.x, top: hover.y - 12 }}
          >
            <span className="mono whitespace-nowrap text-[10px] tracking-[0.02em]">
              <span className="font-semibold text-accent">{hover.count}</span>{" "}
              <span className="text-[var(--text-2)]">
                {hover.count === 1 ? "contribution" : "contributions"} on{" "}
              </span>
              <span className="text-[var(--text-1)]">{formatContributionDate(hover.date)}</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
