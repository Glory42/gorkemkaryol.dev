import { createFileRoute } from "@tanstack/react-router";
import { Code, Globe, Layers, Monitor, Terminal } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ContactLinks } from "@/components/ui/ContactLinks";
import { LiveClock } from "@/components/ui/LiveClock";
import { RotatingPrompt } from "@/components/ui/RotatingPrompt";
import { contactItems, introText, techItems, type TechItem } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gorkem Karyol" },
      { name: "description", content: "Personal portfolio of Gorkem Karyol." },
    ],
  }),
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
      <p className="mono mb-5 text-[11px] text-[#252525] animate-fade-in">~$ whoami</p>
      <section className="mb-10">
        <h1 className="mono mb-2 text-[clamp(20px,2.2vw,30px)] font-bold leading-[1.1] tracking-[-0.01em] text-white animate-fade-in-down">
          Görkem Karyol
        </h1>

        <div className="mb-3 flex items-center gap-2.5 animate-fade-in-down delay-50">
          <span className="mono text-[11px] text-[#444]">Istanbul, Türkiye</span>
          <span className="h-[10px] w-px bg-[rgba(255,255,255,0.07)]" />
          <span className="mono text-[11px] text-[#2e2e2e]">
            <LiveClock
              location="Europe/Istanbul"
              shortName="UTC+3"
              showAt={false}
              timezoneClassName="text-[#252525]"
            />
          </span>
        </div>

        <div className="mb-5 flex items-center gap-2 animate-fade-in-down delay-100">
          <span className="mono text-[11px] text-[rgba(168,85,247,0.65)]">→</span>
          <span className="inline-flex items-center">
            <RotatingPrompt
              className="mono text-[11px] text-[#555]"
              words={["software engineer", "linux enjoyer", "web developer"]}
            />
            <span className="mono text-[11px] text-[rgba(168,85,247,0.55)] animate-pulse">_</span>
          </span>
        </div>

        <p className="mb-5 text-[12px] leading-[1.75] text-[#444] animate-fade-in-up delay-150">
          {introText}
        </p>

        <div className="animate-fade-in-up delay-200">
          <ContactLinks items={contactItems} />
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="mono text-[9px] tracking-[0.25em] text-[rgba(168,85,247,0.55)] uppercase">
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
                  <Icon size={13} className="shrink-0 text-[#282828]" />
                  <span className="mono w-[180px] shrink-0 text-[12px] text-[rgba(255,255,255,0.7)] transition-colors duration-150 group-hover:text-[#a855f7]">
                    {item.spec}
                  </span>
                  <span className="mono text-[11px] text-[#333] italic">
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
