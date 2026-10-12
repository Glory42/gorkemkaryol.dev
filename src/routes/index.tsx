import { createFileRoute } from "@tanstack/react-router";
import { Code, Globe, Layers, Monitor, Terminal } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { pageHead, TerminalPrompt } from "@/components/layout/page";
import { ContactLinks } from "@/features/home/components/ContactLinks";
import { LiveClock } from "@/features/home/components/LiveClock";
import { RotatingPrompt } from "@/features/home/components/RotatingPrompt";
import { contactItems, introText, techItems, type TechItem } from "@/features/home/content";

export const Route = createFileRoute("/")({
  head: () => pageHead("", "Personal portfolio of Gorkem Karyol."),
  component: HomePage,
});

const IconMap: Record<TechItem["iconId"], React.ElementType> = {
  monitor: Monitor,
  layers: Layers,
  code: Code,
  terminal: Terminal,
  globe: Globe,
};

function HomePage() {
  return (
    <PageShell mainClassName="px-[max(24px,4vw)] pt-3 pb-16 md:pt-[max(24px,4vh)]">
      <div className="mx-auto max-w-[680px]">
      <TerminalPrompt cmd="whoami" className="mb-5 animate-fade-in" />
      <section className="mb-10">
        <h1 className="mono mb-2 text-[clamp(20px,2.2vw,30px)] font-bold leading-[1.1] tracking-[-0.01em] text-white animate-fade-in-down">
          Görkem Karyol
        </h1>

        <div className="mb-3 flex items-center gap-2.5 animate-fade-in-down delay-50">
          <span className="mono text-[12px] text-fg-3">Istanbul, Türkiye</span>
          <span className="h-[10px] w-px bg-[rgba(255,255,255,0.07)]" />
          <span className="mono text-[12px] text-fg-4">
            <LiveClock
              location="Europe/Istanbul"
              shortName="UTC+3"
              showAt={false}
              timezoneClassName="text-fg-4"
            />
          </span>
        </div>

        <div className="mb-5 flex items-center gap-2 animate-fade-in-down delay-100">
          <span className="mono text-[12px] text-accent/[0.65]">→</span>
          <span className="inline-flex items-center">
            <RotatingPrompt
              className="mono text-[12px] text-fg-2"
              words={["software engineer", "linux enjoyer", "web developer"]}
            />
            <span className="mono text-[12px] text-accent/[0.65] animate-pulse">_</span>
          </span>
        </div>

        <p className="mb-5 text-[13px] leading-[1.75] text-fg-3 animate-fade-in-up delay-150">
          {introText}
        </p>

        <div className="animate-fade-in-up delay-200">
          <ContactLinks items={contactItems} />
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="mono text-[10px] tracking-[0.25em] text-accent/[0.65] uppercase">
            ./me/setup
          </span>
          <div className="h-px flex-1 bg-[rgba(255,255,255,0.05)]" />
        </div>

        <div className="flex flex-col stagger">
          {techItems.map((item, i) => {
            const Icon = IconMap[item.iconId];
            return (
              <div key={item.title}>
                <div className="group flex items-center gap-4">
                  <Icon size={13} className="shrink-0 text-fg-4" />
                  <span className="mono w-[180px] shrink-0 text-[13px] text-[rgba(255,255,255,0.7)] transition-colors duration-150 group-hover:text-accent">
                    {item.spec}
                  </span>
                  <span className="mono text-[12px] text-fg-4 italic">
                    // {item.description}
                  </span>
                </div>
                {i < techItems.length - 1 && (
                  <div className="my-4 h-px bg-[rgba(255,255,255,0.04)]" />
                )}
              </div>
            );
          })}
        </div>
      </section>
      </div>
    </PageShell>
  );
}
