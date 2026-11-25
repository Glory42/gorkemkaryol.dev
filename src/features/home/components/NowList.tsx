import type { ReactNode } from "react";
import { BookOpen, Briefcase, Hammer, Package, Tv, type LucideIcon } from "lucide-react";
import { HomeSection } from "@/features/home/components/HomeSection";
import { nowItems, type NowItem } from "@/features/home/content";
import type { Currently } from "@/features/interests/currently";
import type { ServiceResult } from "@/server/common/http";

const ICONS: Record<NowItem["label"] | "reading" | "watching", LucideIcon> = {
  building: Hammer,
  looking: Briefcase,
  shipped: Package,
  reading: BookOpen,
  watching: Tv,
};

// Rows stay one line so live titles can't grow the pinned panel; the full text shows on hover.
function Row({ label, title, children }: { label: keyof typeof ICONS; title?: string; children: ReactNode }) {
  const Icon = ICONS[label];
  return (
    <>
      <dt className="inline-flex items-start gap-1.5 text-fg-3">
        <Icon size={12} className="mt-[4px] shrink-0" aria-hidden="true" />
        {label}
      </dt>
      <dd className="m-0 min-w-0 truncate text-fg-1" title={title}>
        {children}
      </dd>
    </>
  );
}

const linkClass = "text-fg-1 no-underline hover:text-accent";

const NOTHING: Currently = { reading: null, watching: null };

function LiveRows({ now }: { now: Currently }) {
  const { reading, watching } = now;
  const empty = "nothing right now";
  return (
    <>
      <Row label="reading" title={reading ? [reading.title, reading.subtitle].filter(Boolean).join(" · ") : undefined}>
        {reading?.href ? (
          <a href={reading.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {reading.title}
          </a>
        ) : (
          empty
        )}
      </Row>
      <Row label="watching" title={watching ? [watching.title, watching.subtitle].filter(Boolean).join(" · ") : undefined}>
        {watching?.href ? (
          <a href={watching.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {watching.title}
            {watching.subtitle && <span className="text-fg-3"> · {watching.subtitle}</span>}
          </a>
        ) : (
          empty
        )}
      </Row>
    </>
  );
}

export function NowList({ live }: { live: ServiceResult<Currently> }) {
  return (
    <HomeSection cmd="cat now.txt">
      <dl className="mono grid grid-cols-[92px_1fr] gap-x-3 gap-y-[var(--home-gap-row,10px)] text-[13px]">
        {nowItems.map((item) => (
          <Row key={item.label} label={item.label}>
            <a
              href={item.href}
              {...(item.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className={linkClass}
            >
              {item.text}
            </a>
          </Row>
        ))}
        <LiveRows now={live.ok ? live.data : NOTHING} />
      </dl>
    </HomeSection>
  );
}
