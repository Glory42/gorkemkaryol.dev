import { HomeHeading } from "@/features/home/components/HomeSection";
import { ContactLinks } from "@/components/ui/ContactLinks";
import { LiveClock } from "@/features/home/components/LiveClock";
import { NowList } from "@/features/home/components/NowList";
import { RotatingPrompt } from "@/features/home/components/RotatingPrompt";
import { hero, introText } from "@/features/home/content";
import { contactItems, profile } from "@/lib/profile";
import type { Currently } from "@/features/interests/currently";
import type { ServiceResult } from "@/server/common/http";

function StatusBadge() {
  return (
    <span className="mono inline-flex items-center gap-2 text-[12px] text-[#4ade80]">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ade80]" />
      </span>
      {hero.status}
    </span>
  );
}

// Pinned via `home-panel`, so keep it short; margins subtract each line's leading so visible gaps equal --home-gap(-sm).
export function IdentityPanel({ live }: { live: ServiceResult<Currently> }) {
  return (
    <aside className="home-panel md:self-start">
      <div className="animate-fade-in">
        <HomeHeading cmd="whoami" />
      </div>
      <h1 className="mono text-[clamp(28px,3vw,34px)] font-bold leading-[1.05] tracking-[-0.02em] text-white animate-fade-in-down">
        {profile.name}
      </h1>
      <p className="mono mt-[calc(var(--home-gap-sm)-5px)] text-[14px] text-fg-2 animate-fade-in-down delay-50">
        <span className="sr-only">{hero.roles[0]}</span>
        <span aria-hidden="true">
          <span className="inline-block -translate-y-[2px] text-accent/[0.65]">→</span>{" "}
          <RotatingPrompt words={hero.roles} />
          <span className="text-accent/[0.65] animate-pulse">_</span>
        </span>
      </p>
      <p className="mono mt-[calc(var(--home-gap-sm)-7px)] text-[13px] text-fg-3 animate-fade-in-down delay-100">
        {profile.location} ·{" "}
        <LiveClock
          location={profile.timezone}
          shortName={profile.timezoneLabel}
          showAt={false}
          timezoneClassName="text-fg-3"
        />
      </p>
      <div className="mt-[calc(var(--home-gap)-13px)] animate-fade-in-up delay-150">
        <StatusBadge />
      </div>
      <p className="mt-[calc(var(--home-gap)-13px)] text-[14px] leading-[1.75] text-fg-2 animate-fade-in-up delay-150">{introText}</p>
      <div className="mt-[calc(var(--home-gap)-10px)] animate-fade-in-up delay-200">
        <ContactLinks items={contactItems} />
      </div>
      <div className="mt-[calc(var(--home-gap)-7px)] animate-fade-in-up delay-300">
        <NowList live={live} />
      </div>
    </aside>
  );
}
